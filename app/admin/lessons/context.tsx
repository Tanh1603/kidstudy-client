/* eslint-disable import/order */
"use client";
import LessonDTO, { LessonDTOCreate } from "@/app/models/Lesson";
import {
  createLesson,
  deleteLessonById,
  getLessons,
  updateLessonById,
} from "@/app/services/admin/lessons";
import { useAuth } from "@clerk/nextjs";
import { useUnits } from "../units/context";
import { createContext, useContext, useEffect, useState } from "react";

interface LessonContextType {
  lessons: LessonDTO[];
  setLessons: (lessons: LessonDTO[]) => void;
  isLessonModalOpen: boolean;
  currentLesson: LessonDTO | null;
  setCurrentLesson: (lesson: LessonDTO | null) => void;
  setIsLessonModalOpen: (isLessonModalOpen: boolean) => void;
  addLesson: (lesson: LessonDTOCreate) => Promise<void>;
  updateLesson: (lesson: LessonDTO) => Promise<void>;
  deleteLesson: (id: number) => Promise<void>;
}
const LessonContext = createContext<LessonContextType>({
  lessons: [],
  setLessons: () => {},
  isLessonModalOpen: false,
  currentLesson: null,
  setCurrentLesson: () => {},
  setIsLessonModalOpen: () => {},
  addLesson: async () => {},
  updateLesson: async () => {},
  deleteLesson: async () => {},
});

export const LessonProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();
  const { units } = useUnits();
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
  }, [getToken, units.length]);

  const addLesson = async (lesson: LessonDTOCreate) => {
    const token = await getToken();
    if (!token) {
      return;
    }
    const newLesson = await createLesson(token, lesson);
    setLessons([...lessons, newLesson]);
  };

  const updateLesson = async (lesson: LessonDTO) => {
    const token = await getToken();
    if (!token) {
      return;
    }
    const updatedLesson = await updateLessonById(token, lesson);
    setLessons(lessons.map((l) => (l.id === lesson.id ? updatedLesson : l)));
  };

  const deleteLesson = async (id: number) => {
    const token = await getToken();
    if (!token) {
      return;
    }
    await deleteLessonById(token, id);
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
