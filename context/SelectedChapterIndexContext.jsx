"use client";

import { createContext, useState } from "react";

export const SelectedChapterIndexContext = createContext(undefined);

export function SelectedChapterIndexProvider({ children }) {
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);

  return (
    <SelectedChapterIndexContext.Provider
      value={{ selectedChapterIndex, setSelectedChapterIndex }}
    >
      {children}
    </SelectedChapterIndexContext.Provider>
  );
}
