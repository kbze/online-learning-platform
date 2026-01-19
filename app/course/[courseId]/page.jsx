"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import AppHeader from "@/app/workspace/_components/AppHeader";
import ChapterListSidebar from "../_components/ChapterListSidebar";
import ChapterContent from "../_components/ChapterContent";
import {
  SelectedChapterIndexProvider,
} from "@/context/SelectedChapterIndexContext";

function Course() {
  const { courseId } = useParams();
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const res = await axios.get(
          "/api/enroll-course?courseId=" + courseId
        );
        setCourseInfo(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!courseInfo) return <div className="p-10">Course not found</div>;

  return (
    <SelectedChapterIndexProvider>
      <AppHeader hideSiebar />

      <div className="flex gap-10">
        <ChapterListSidebar courseInfo={courseInfo} />
        <ChapterContent courseInfo={courseInfo} />
      </div>
    </SelectedChapterIndexProvider>
  );
}

export default Course;
