"use client";

import React, { useContext } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, Check, Circle } from "lucide-react";
import { SelectedChapterIndexContext } from "@/context/SelectedChapterIndexContext";

function ChapterListSidebar({ courseInfo }) {
  const courseContent = courseInfo?.courses?.courseContent || [];
  const completedChapter =
    courseInfo?.enrollCourse?.completedChapters ?? [];

  const { selectedChapterIndex, setSelectedChapterIndex } =
    useContext(SelectedChapterIndexContext);

  return (
    <div className="w-80 h-screen bg-[#f6f8fb] p-4 fixed border-r overflow-y-auto">
      <h2 className="mb-4 font-semibold text-lg">
        Chapters ({courseContent.length})
      </h2>

      <Accordion.Root type="single" collapsible className="space-y-2">
        {courseContent.map((chapter, index) => {
          const isCompleted = completedChapter.includes(index);
          const isActive = selectedChapterIndex === index;

          return (
            <Accordion.Item
              key={index}
              value={String(index)}
              className="rounded-lg overflow-hidden border"
            >
              {/* CHAPTER HEADER */}
              <Accordion.Trigger
                onClick={() => setSelectedChapterIndex(index)}
                className={`
                  w-full flex items-center justify-between
                  px-4 py-3 text-left
                  text-sm font-semibold
                  transition
                  ${
                    isActive
                      ? "bg-white border-l-4 border-purple-600"
                      : "bg-[#f6f8fb] hover:bg-white"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">
                    {index + 1}.
                  </span>

                  <span className="text-gray-800">
                    {chapter?.courseData?.chapterName}
                  </span>

                  {isCompleted && (
                    <Check
                      size={14}
                      className="text-green-600"
                    />
                  )}
                </div>

                <ChevronDown
                  size={16}
                  className="text-gray-400"
                />
              </Accordion.Trigger>

              {/* TOPICS */}
              <Accordion.Content>
                <div className="bg-white px-4 py-3 space-y-2 border-t">
                  {chapter?.courseData?.topics?.map((topic, i) => (
                    <div
                      key={i}
                      className="
                        flex items-start gap-2
                        text-base
                        text-gray-700
                        font-medium
                        px-3 py-2
                        rounded-md
                        cursor-pointer
                        transition
                        hover:bg-purple-50
                        hover:text-purple-700
                      "
                    >
                      <Circle
                        size={8}
                        className="mt-2 text-purple-500"
                      />
                      <span>{topic?.topic}</span>
                    </div>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
    </div>
  );
}

export default ChapterListSidebar;
