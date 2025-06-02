/* eslint-disable import/order */
import QuestDTO, { QuestUserDTO } from "@/app/models/QuestDTO";
import api from "../api";

const getQuest = async (token: string): Promise<QuestDTO[]> => {
  try {
    const response = await api.get("admin/quests", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data as QuestDTO[];
  } catch (error) {
    console.error("Error fetching quest:", error);
    throw error;
  }
};

const createQuest = async (
  token: string,
  quest: QuestDTO
): Promise<QuestDTO> => {
  try {
    const response = await api.post("admin/quests", quest, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as QuestDTO;
  } catch (error) {
    console.error("Error create quest:", error);
    throw error;
  }
};

const updateQuest = async (
  token: string,
  quest: QuestDTO
): Promise<QuestDTO> => {
  try {
    const response = await api.put(`admin/quests/${quest.id}`, quest, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as QuestDTO;
  } catch (error) {
    console.error("Error update quest:", error);
    throw error;
  }
};

const deleteQuest = async (token: string, id: number) => {
  try {
    await api.delete(`admin/quests/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error delete quest:", error);
    throw error;
  }
};

//user

const getDailyQuest = async (
  token: string,
  userId: string
): Promise<QuestUserDTO[]> => {
  try {
    const response = await api.get(`user/quests?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as QuestUserDTO[];
  } catch (error) {
    console.error("Error fetching daily quests:", error);
    throw error;
  }
};

const addPointToquest = async (
  token: string,
  userId: string,
  points: number
) => {
  try {
    await api.put(
      `user/quests/daily-points`,
      {
        userId,
        points,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error add point to quest:", error);
    throw error;
  }
};

const resetDailyQuest = async (token: string, userId: string) => {
  try {
    await api.post(
      `user/quests/reset`,
      { userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error reset daily quest:", error);
    throw error;
  }
};

export {
  getQuest,
  createQuest,
  updateQuest,
  deleteQuest,
  getDailyQuest,
  addPointToquest,
  resetDailyQuest,
};
