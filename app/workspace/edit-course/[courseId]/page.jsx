"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import CourseInfo from "../_components/CourseInfo";
import ChapterTopicList from "../_components/ChapterTopicList";

export default function EditCourse({ viewCourse = false }) {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const res = await axios.get(
          `/api/courses?courseId=${courseId}`
        );
        setCourse(res.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          // course does not exist → stop
          setLoading(false);
        } else {
          console.error(err);
        }
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return <div className="p-10">Loading course...</div>;
  }

  if (!course) {
    return (
      <div className="p-10 text-red-500">
        Course not found.
      </div>
    );
  }

  return (
    <div>
      <CourseInfo course={course} viewCourse={viewCourse} />
      <ChapterTopicList course={course} />
    </div>
  );
}
