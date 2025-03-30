import UserProgressDTO from "../models/UserProgressDTO";
import api from "./api";

const getUserProgress = async (
  token: string,
  userId: string
): Promise<UserProgressDTO> => {
  try {
    const response = await api.get<UserProgressDTO>(
      `/user/user-progress/${userId}`,
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

const getLeaderboard = async (
  token: string,
  size: number
): Promise<UserProgressDTO[]> => {
  const response = await api.get<UserProgressDTO[]>(
    `/user/user-progress/leaderboard?size=${size}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export { getUserProgress, getLeaderboard };
