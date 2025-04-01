/* eslint-disable import/order */
import UnitDTO from "@/app/models/UnitDTO";
import api from "../api";
const getUnits = async (token: string) => {
  try {
    const response = await api.get("/admin/units", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as UnitDTO[];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getUnits };
