/* eslint-disable import/order */
import ChallengeDTO from "@/app/models/ChallengeDTO";
import api from "../api";
const getChallenges = async (token: string) => {
  try {
    const response = await api.get("/admin/challenges", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as ChallengeDTO[];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getChallenges };
