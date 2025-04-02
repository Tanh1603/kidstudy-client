/* eslint-disable import/order */
import UnitDTO, { UnitDTOCreate } from "@/app/models/UnitDTO";
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
const createUnit = async (token: string, unit: UnitDTOCreate) => {
  try {
    const response = await api.post("/admin/units", unit, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as UnitDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateUnitById = async (token: string, unit: UnitDTO) => {
  try {
    const response = await api.put(`/admin/units/${unit.id}`, unit, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as UnitDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteUnitById = async (token: string, unitId: number) => {
  try {
    const response = await api.delete(`/admin/units/${unitId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as UnitDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
};


export { getUnits, createUnit, updateUnitById, deleteUnitById };
