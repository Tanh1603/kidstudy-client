/* eslint-disable import/order */
import LessonDTO, { LessonDTOCreate } from "@/app/models/Lesson";
import api from "../api";
const getLessons = async (token: string) => {
  try {
    const response = await api.get("/admin/lessons", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as LessonDTO[];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createLesson = async (token: string, lesson: LessonDTOCreate) => {
  try {
    const response = await api.post("/admin/lessons", lesson, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as LessonDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateLessonById = async (token: string, lesson: LessonDTO) => {
  try {
    const response = await api.put(`/admin/lessons/${lesson.id}`, lesson, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as LessonDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteLessonById = async (token: string, id: number) => {
  try {
    const response = await api.delete(`/admin/lessons/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as LessonDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getLessons, createLesson, updateLessonById, deleteLessonById };
