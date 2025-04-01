/* eslint-disable import/order */
"use client";
import LessonDTO from "@/app/models/Lesson";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { getLessons } from "@/app/services/admin/lessons";
import { TableComponent } from "@/components/table";

const LessonsPage = () => { 
  const { getToken } = useAuth();
  const [lessons, setLessons] = useState<LessonDTO[]>([]);

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
  }, [getToken]);

  return <TableComponent headers={["id", "title", "unitId", "order"]} data={lessons.map((lesson) => ({
    id: lesson.id.toString(),
    title: lesson.title,
    unitId: lesson.unitId.toString(),
    order: lesson.order,
  }))} />;
};

export default LessonsPage;
