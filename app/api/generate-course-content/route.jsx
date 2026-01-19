import { NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const PROMPT = `Depends on Chapter name and Topic Generate content for each topic in HTML 
and give response in JSON format. 
Schema:{
chapterName:<>,
{
topic:<>,
content:<>
}
}
: User Input:
`;

export async function POST(req) {
  try {
    const { courseJson, courseTitle, courseId } = await req.json();

    const promises = courseJson?.chapters?.map(async (chapter) => {
      console.log("➡️ Generating chapter:", chapter?.chapterName);

      // ===== GROQ AI =====
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are a JSON API. Return ONLY valid JSON. No markdown, no explanations.",
          },
          {
            role: "user",
            content: PROMPT + JSON.stringify(chapter),
          },
        ],
        temperature: 0.2,
      });

      const RawResp = completion.choices[0].message.content;
      console.log("🧠 Raw AI response:", RawResp);

      const RawJson = RawResp
        .replace("```json", "")
        .replace("```", "")
        .trim();

      let JSONResp;
      try {
        JSONResp = JSON.parse(RawJson);
      } catch (err) {
        console.error("❌ Invalid JSON from Groq:", RawResp);
        throw new Error("Groq returned invalid JSON");
      }

      // ===== YOUTUBE =====
      console.log("📺 Fetching YouTube videos");
      const youtubeData = await GetYoutubeVideo(chapter?.chapterName);

      return {
        youtubeVideo: youtubeData,
        courseData: JSONResp,
      };
    });

    const CourseContent = await Promise.all(promises);

    // ===== DATABASE =====
    console.log("💾 Saving course content to DB");
    await db
      .update(coursesTable)
      .set({ courseContent: CourseContent })
      .where(eq(coursesTable.cid, courseId));

    return NextResponse.json({
      courseName: courseTitle,
      CourseContent,
    });
  } catch (error) {
    console.error("🔥 API ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ================= YOUTUBE HELPER =================

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";

async function GetYoutubeVideo(topic) {
  const params = {
    part: "snippet",
    q: topic,
    maxResult: 4,
    type: "video",
    key: process.env.YOUTUBE_API_KEY,
  };

  const resp = await axios.get(YOUTUBE_BASE_URL, { params });

  return resp.data.items.map((item) => ({
    videoId: item.id?.videoId,
    title: item?.snippet?.title,
  }));
}
