import { date } from "drizzle-orm/mysql-core";

import api from "./api";

const upsertChallengeProgress = async (
  token: string,
  challengeId: number,
  userId: string
) => {
  try {
    const response = await api(
      `/user/challenges/${challengeId}/progress/upsert?userId=${userId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export { upsertChallengeProgress };
