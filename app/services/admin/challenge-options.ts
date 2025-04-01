/* eslint-disable import/order */
import api from "../api";
import ChallengeOptionDTO from "@/app/models/ChallengeOptionDTO";

const getChallengeOptions = async (token: string) => {
  try {
    const response = await api.get("/admin/challenge-options", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as ChallengeOptionDTO[];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getChallengeOptions };
