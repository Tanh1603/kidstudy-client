
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export { upsertChallengeProgress };
