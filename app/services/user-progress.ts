import UserProgressDTO, {
  UserProgressDTOCreate,
} from "../models/UserProgressDTO";

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

type HeartsResponse = {
  error?: string;
  message?: string;
  success?: boolean;
};

const reduceHearts = async (
  token: string,
  challengeId: number,
  userId: string
): Promise<HeartsResponse> => {
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
    return response.data as HeartsResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const refillHearts = async (
  token: string,
  userId: string
): Promise<HeartsResponse> => {
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
    return response.data as HeartsResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateUserPoints = async (
  token: string,
  userId: string,
  points: number
) => {
  try {
    const response = await api.patch(
      `/user/user-progress/${userId}/points`,
      { points: points },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Update user points response:", response.data);
    
    return response.data as UserProgressDTO;
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
  updateUserPoints,
};
