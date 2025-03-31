import api from "./api";
import UserProgressDTO, {
  UserProgressDTOCreate,
} from "../models/UserProgressDTO";

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

const upsertUserProgress = async (
  token: string,
  userProgress: UserProgressDTOCreate
) => {
  try {
    const response = await api.put<UserProgressDTOCreate>(
      `/user/user-progress/upsert`,
      userProgress,
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

const reduceHearts = async (
  token: string,
  challengeId: number,
  userId: string
) => {
  try {
    const response = await api.put(
      `/user/user-progress/reduce-hearts?challengeId=${challengeId}&userId=${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as string;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const refillHearts = async (token: string, userId: string) => {
  try {
    const response = await api.put(
      `/user/user-progress/refill-hearts?userId=${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as string;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export {
  getUserProgress,
  upsertUserProgress,
  getLeaderboard,
  reduceHearts,
  refillHearts,
};
