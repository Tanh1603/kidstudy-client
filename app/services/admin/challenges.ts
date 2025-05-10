/* eslint-disable import/order */
import ChallengeDTO, { ChallengeForm } from "@/app/models/ChallengeDTO";
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

const createChallenge = async (token: string, challenge: ChallengeForm) => {
  try {
    const response = await api.post("/admin/challenges", challenge, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data as ChallengeDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateChallenge = async (token: string, challenge: ChallengeForm) => {
  try {
    console.log(challenge.id);

    const response = await api.put(
      `/admin/challenges/${challenge.id}`,
      challenge,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response.data as ChallengeDTO);
    return response.data as ChallengeDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteChallenge = async (token: string, id: number) => {
  try {
    await api.delete(`/admin/challenges/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};


export { getChallenges, createChallenge, updateChallenge, deleteChallenge };
