/* eslint-disable import/order */
import LessonDTO from "@/app/models/Lesson";
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

export { getLessons };
