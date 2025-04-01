/* eslint-disable import/order */
"use client";
import LessonDTO, { LessonDTOCreate } from "@/app/models/Lesson";
import { getLessons } from "@/app/services/admin/lessons";
import { useAuth } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useState } from "react";

interface LessonContextType {
  lessons: LessonDTO[];
  setLessons: (lessons: LessonDTO[]) => void;
  isLessonModalOpen: boolean;
  currentLesson: LessonDTO | null;
  setCurrentLesson: (lesson: LessonDTO | null) => void;
  setIsLessonModalOpen: (isLessonModalOpen: boolean) => void;
  addLesson: (lesson: LessonDTOCreate) => void;
  updateLesson: (lesson: LessonDTO) => void;
  deleteLesson: (id: number) => void;
}
const LessonContext = createContext<LessonContextType>({
  lessons: [],
  setLessons: () => {},
  isLessonModalOpen: false,
  currentLesson: null,
  setCurrentLesson: () => {},
  setIsLessonModalOpen: () => {},
  addLesson: () => {},
  updateLesson: () => {},
  deleteLesson: () => {},
});

export const LessonProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();
  const [lessons, setLessons] = useState<LessonDTO[]>([]);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<LessonDTO | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      const token = await getToken();
      if (!token) {
        return;
      }
      const lessons = await getLessons(token);
      setLessons(lessons);
    };
    void fetchLessons();
  }, [getToken, setLessons]);
  const addLesson = (lesson: LessonDTOCreate) => {
    setLessons([...lessons, lesson as LessonDTO]);
  };

  const updateLesson = (lesson: LessonDTO) => {
    setLessons(lessons.map((l) => (l.id === lesson.id ? lesson : l)));
  };

  const deleteLesson = (id: number) => {
    setLessons(lessons.filter((l) => l.id !== id));
  };

  return (
    <LessonContext.Provider
      value={{
        lessons,
        setLessons,

        isLessonModalOpen,
        setIsLessonModalOpen,

        currentLesson,
        setCurrentLesson,

        addLesson,
        updateLesson,
        deleteLesson,
      }}
    >
      {children}
    </LessonContext.Provider>
  );
};

export const useLessons = () => {
  const context = useContext(LessonContext);
  if (!context) {
    throw new Error("useLessons must be used within a LessonProvider");
  }
  return context;
};

export default LessonContext;
