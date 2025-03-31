import api from "./api";
import LessonDTO from "../models/Lesson";
import FirstIncompleteLessonDTO from "../models/UnitProgressDTO";

const getLessonPercentage = async (
  token: string,
  lessonId: string,
  userId: string
): Promise<number> => {
  try {
    const response = await api.get<{ percentage: number }>(
      `/user/lessons/${lessonId}/percentage?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data as unknown as number;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getFirstIncompleteLesson = async (
  token: string,
  userId: string
): Promise<FirstIncompleteLessonDTO> => {
  try {
    const response = await api.get<FirstIncompleteLessonDTO>(
      `/user/lessons/first-incomplete?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getUserLessonById = async (
  token: string,
  lessonId: number,
  userId: string
): Promise<LessonDTO> => {
  try {
    const response = await api.get<LessonDTO>(
      `/user/lessons/${lessonId}?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getLessonPercentage, getFirstIncompleteLesson, getUserLessonById };
