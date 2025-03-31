import api from "./api";
import UnitDTO from "../models/UnitDTO";
import UnitProgressDTO from "../models/UnitProgressDTO";

const getUnitProgress = async (
  token: string,
  userId: string
): Promise<UnitProgressDTO> => {
  try {
    const response = await api.get<UnitProgressDTO>(
      `/user/unit-progress?userId=${userId}`,
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

const getUnits = async (token: string, userId: string): Promise<UnitDTO[]> => {
  try {
    const response = await api.get<UnitDTO[]>(`/user/units?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getUnitProgress, getUnits };
