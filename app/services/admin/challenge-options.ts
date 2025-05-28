/* eslint-disable import/order */
import api from "../api";
import ChallengeOptionDTO, { ChallengeOptionForm } from "@/app/models/ChallengeOptionDTO";

const getChallengeOptionsByChallengeId = async (
  token: string,
  challengeId: number
) => {
  try {
    const response = await api.get(
      `/admin/challenge-options?challengeId=${challengeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as ChallengeOptionDTO[];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createChallengeOptions = async (
  options: ChallengeOptionForm,
  token: string
) => {
  try {
    console.log(options);

    const response = await api.post("/admin/challenge-options", options, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as ChallengeOptionDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateChallengeOptions = async (
  options: ChallengeOptionForm,
  token: string
) => {
  try {
    const response = await api.put(
      `/admin/challenge-options/${options.id}`,
      options,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as ChallengeOptionDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteChallengeOptions = async (id: number, token: string) => {
  try {
    const response = await api.delete(`/admin/challenge-options/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as ChallengeOptionDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export {
  getChallengeOptionsByChallengeId,
  createChallengeOptions,
  updateChallengeOptions,
  deleteChallengeOptions,
};
