"use client";

import { Button } from "@/components/ui/button";
import { SelectedChapterIndexContext } from "@/context/SelectedChapterIndexContext";
import axios from "axios";
import { CheckCircle, Loader2Icon, X } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useContext, useState } from "react";
import YouTube from "react-youtube";
import { toast } from "sonner";

function ChapterContent({ courseInfo, refreshData }) {
  const { courseId } = useParams();

  const courseContent = courseInfo?.courses?.courseContent || [];
  const enrollCourse = courseInfo?.enrollCourse;

  const { selectedChapterIndex } = useContext(
    SelectedChapterIndexContext
  );

  const currentChapter = courseContent[selectedChapterIndex];
  const videoData = currentChapter?.youtubeVideo || [];
  const topics = currentChapter?.courseData?.topics || [];

  const completedChapter = enrollCourse?.completedChapters ?? [];
  const isCompleted = completedChapter.includes(selectedChapterIndex);

  const [loading, setLoading] = useState(false);

  /* =========================
     GENERATE CONTENT
  ========================= */
  const generateContent = async () => {
    try {
      setLoading(true);
      await axios.post("/api/generate-course-content", {
        courseId,
      });
      toast.success("Course content generated successfully!");
      refreshData?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     MARK COMPLETE
  ========================= */
  const markChapterCompleted = async () => {
    setLoading(true);

    const updated = [
      ...new Set([...completedChapter, selectedChapterIndex]),
    ];

    await axios.put("/api/enroll-course", {
      courseId,
      completedChapter: updated,
    });

    toast.success("Chapter marked as completed!");
    refreshData?.();
    setLoading(false);
  };

  /* =========================
     MARK INCOMPLETE
  ========================= */
  const markInCompleteChapter = async () => {
    setLoading(true);

    const updated = completedChapter.filter(
      (item) => item !== selectedChapterIndex
    );

    await axios.put("/api/enroll-course", {
      courseId,
      completedChapter: updated,
    });

    toast.success("Chapter marked as incomplete!");
    refreshData?.();
    setLoading(false);
  };

  if (!currentChapter) {
    return (
      <div className="ml-80 mt-20 px-10 text-gray-500">
        No chapter selected.
      </div>
    );
  }

  return (
    <div className="ml-80 mt-20 px-10 pb-20 max-w-5xl">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-bold text-3xl text-gray-800">
          {selectedChapterIndex + 1}.{" "}
          {currentChapter?.courseData?.chapterName}
        </h2>

        {!isCompleted ? (
          <Button
            onClick={markChapterCompleted}
            disabled={loading}
            className="flex gap-2 bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <CheckCircle />
            )}
            Mark as Completed
          </Button>
        ) : (
          <Button
            onClick={markInCompleteChapter}
            disabled={loading}
            className="flex gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <X />
            )}
            Completed
          </Button>
        )}
      </div>

      {/* ================= VIDEOS ================= */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4">
          Related Videos 🎬
        </h3>

        {videoData.length === 0 ? (
          <p className="text-gray-500 italic">
            No videos available for this chapter.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videoData.slice(0, 2).map((video, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden shadow-sm border bg-white"
              >
                <YouTube
                  videoId={video?.videoId}
                  opts={{
                    width: "100%",
                    height: "250",
                  }}
                />
                <div className="p-3 text-sm text-gray-700">
                  {video?.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= TOPICS CONTENT ================= */}
      <div className="space-y-8">
        {topics.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">
              Content not generated yet
            </h3>
            <p className="text-sm mb-4">
              Click below to generate the content for this course.
            </p>

            <Button onClick={generateContent} disabled={loading}>
              {loading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                "Generate Content"
              )}
            </Button>
          </div>
        ) : (
          topics.map((topic, index) => (
            <div
              key={index}
              className="bg-white border rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-2xl font-bold text-purple-700 mb-4">
                {index + 1}. {topic?.topic}
              </h3>

              <div
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: topic?.content,
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChapterContent;
