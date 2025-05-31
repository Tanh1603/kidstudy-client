import { DifficultyEnum, GameQuestion, GameTypeEnum } from "@/app/models/Game";
import api from "../api";

const getRandomGameQuestion = async (
  token: string,
  gameType: GameTypeEnum,
  difficulty: DifficultyEnum,
  topicId: number,
  limit: number = 10
) => {
  try {
    console.log(limit);
    
    const response = await api.get(
      `user/mini-games?gameType=${gameType}&difficulty=${difficulty}&topicId=${topicId}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Response data:", response.data);
    
    return response.data as GameQuestion[];
  } catch (error) {
    console.error("Error fetching random game question:", error);
    throw error;
  }
};

const getGameQuestionsByGameType = async (
  token: string,
  gameType: GameTypeEnum
) => {
  try {
    if (GameTypeEnum[gameType] === undefined) {
      throw new Error("Invalid game type provided");
    }
    console.log("Fetching game questions for game type:", gameType);

    const response = await api.get(`admin/mini-games?gameType=${gameType}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data as GameQuestion[];
  } catch (error) {
    console.error("Error fetching game questions:", error);
    throw error;
  }
};

const createGameQuestion = async (token: string, question: FormData) => {
  try {
    const response = await api.post(`admin/mini-games`, question, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data as GameQuestion[];
  } catch (error) {
    console.error("Error fetching game questions:", error);
    throw error;
  }
};

const updateGameQuestion = async (
  token: string,
  id: number,
  question: FormData
) => {
  try {
    const response = await api.put(`admin/mini-games/${id}`, question, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data as GameQuestion[];
  } catch (error) {
    console.error("Error fetching game questions:", error);
    throw error;
  }
};

const deleteGameQuestion = async (token: string, id: number) => {
  try {
    await api.delete(`admin/mini-games/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error fetching game questions:", error);
    throw error;
  }
};

export {
  getGameQuestionsByGameType,
  getRandomGameQuestion,
  createGameQuestion,
  updateGameQuestion,
  deleteGameQuestion,
};
