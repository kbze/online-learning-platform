import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

/* =========================
   SAFE JSON SANITIZER
========================= */
const sanitize = (data) => JSON.parse(JSON.stringify(data));

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseIdParam = searchParams.get("courseId");
    const user = await currentUser();

    /* =========================
       CASE 1: PUBLIC COURSES
       /api/courses?courseId=0
    ========================= */
    if (courseIdParam === "0") {
      const result = await db
        .select()
        .from(coursesTable)
        .where(sql`${coursesTable.courseContent}::jsonb != '{}'::jsonb`)
        .orderBy(desc(coursesTable.id));

      return NextResponse.json(sanitize(result));
    }

    /* =========================
       CASE 2: SINGLE COURSE
       /api/courses?courseId=<uuid>
    ========================= */
    if (
      courseIdParam &&
      courseIdParam !== "undefined" &&
      courseIdParam !== "null"
    ) {
      const result = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.cid, courseIdParam));

      if (!result.length) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(sanitize(result[0]));
    }

    /* =========================
       CASE 3: USER COURSES
       /api/courses
    ========================= */
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.userEmail, user.primaryEmailAddress.emailAddress))
      .orderBy(desc(coursesTable.id));

    return NextResponse.json(sanitize(result));
  } catch (error) {
    console.error("GET /api/courses error:", error);

    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
