import { db } from '@/config/db';
import { coursesTable } from '@/config/schema';
import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import axios from 'axios';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const PROMPT = `
You are a JSON API.

STRICT RULES:
- Output MUST be valid JSON
- Do NOT add explanations
- Do NOT add markdown
- Do NOT add text before or after JSON
- Do NOT say "Here is"
- Do NOT wrap with \`\`\`

VERY IMPORTANT:
- You MUST generate a meaningful, complete course description
- The description MUST be at least 2 full sentences
- The description MUST NOT be empty

Generate a professional learning course.

Schema:
{
  "course": {
    "name": "string",
    "description": "string (REQUIRED, at least 2 sentences)",
    "category": "string",
    "level": "string",
    "includeVideo": "boolean",
    "noOfChapters": "number",
    "bannerImagePrompt": "string",
    "chapters": [
      {
        "chapterName": "string",
        "duration": "string",
        "topics": ["string"]
      }
    ]
  }
}

User Input:
`;


/* =========================
   SAFE JSON EXTRACTOR
========================= */
function extractJSON(text) {
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1) {
    throw new Error('No JSON found in AI response');
  }
  return JSON.parse(text.slice(first, last + 1));
}

export async function POST(req) {
  try {
    const {
      courseId,
      name,
      description,
      includeVideo,
      noOfChapters,
      category,
      level,
    } = await req.json();

    const user = await currentUser();
    const { has } = await auth();
    const hasPremiumAccess = has({ plan: 'starter' });

    /* 🔒 HARD GUARDS */
    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 }
      );
    }

    if (!name || !level || !noOfChapters) {
      return NextResponse.json(
        { error: 'name, level and noOfChapters are required' },
        { status: 400 }
      );
    }

    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Free user limit
    // if (!hasPremiumAccess) {
    //   const existing = await db
    //     .select()
    //     .from(coursesTable)
    //     .where(eq(coursesTable.userEmail, user.primaryEmailAddress.emailAddress));

    //   if (existing.length >= 1) {
    //     return NextResponse.json({ resp: 'limit exceed' });
    //   }
    // }

    /* === GROQ REQUEST === */
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: 'You ONLY return valid JSON. No text.',
        },
        {
          role: 'user',
          content:
            PROMPT +
            JSON.stringify({
              name,
              description,
              includeVideo,
              noOfChapters,
              category,
              level,
            }),
        },
      ],
    });

    const rawText = completion.choices[0].message.content;
    const courseJson = extractJSON(rawText);

    /* === GENERATE BANNER IMAGE === */
    const imagePrompt = courseJson.course.bannerImagePrompt;
    const bannerImageUrl = imagePrompt
      ? await GenerateImage(imagePrompt)
      : null;

    await db.insert(coursesTable).values({
      cid: courseId,
      userEmail: user.primaryEmailAddress.emailAddress,
      courseJson,
      bannerImageUrl,
      name,
      description,
      category,
      level,
      includeVideo,
      noOfChapters,
    });

    return NextResponse.json({ courseId });
  } catch (error) {
    console.error('Generate Course Layout Error:', error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   IMAGE GENERATION
========================= */
const GenerateImage = async (imagePrompt) => {
  const BASE_URL = 'https://aigurulab.tech';

  const result = await axios.post(
    BASE_URL + '/api/generate-image',
    {
      width: 1024,
      height: 1024,
      input: imagePrompt,
      model: 'flux',
      aspectRatio: '16:9',
    },
    {
      headers: {
        'x-api-key': process?.env?.AI_GURU_LAB_API,
        'Content-Type': 'application/json',
      },
    }
  );
console.log(result.data.image);
  return result.data.image;
};
