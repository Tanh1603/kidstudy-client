/* eslint-disable import/order */
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import UnitDTO, { UnitDTOCreate } from "@/app/models/UnitDTO";
import { useAuth } from "@clerk/nextjs";
import {
  createUnit,
  getUnits,
  updateUnitById,
  deleteUnitById,
} from "@/app/services/admin/units";

interface UnitContextType {
  units: UnitDTO[];
  setUnits: (units: UnitDTO[]) => void;
  isUnitModalOpen: boolean;
  currentUnit: UnitDTO | null;
  setCurrentUnit: (unit: UnitDTO | null) => void;
  setIsUnitModalOpen: (isUnitModalOpen: boolean) => void;
  addUnit: (unit: UnitDTOCreate) => Promise<void>;
  updateUnit: (unit: UnitDTO) => Promise<void>;
  deleteUnit: (id: number) => Promise<void>;
}

const UnitContext = createContext<UnitContextType>({
  units: [],
  setUnits: () => {},
  isUnitModalOpen: false,
  currentUnit: null,
  setCurrentUnit: () => {},
  setIsUnitModalOpen: () => {},
  addUnit: async () => {},
  updateUnit: async () => {},
  deleteUnit: async () => {},
});

export const UnitProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();

  const [units, setUnits] = useState<UnitDTO[]>([]);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<UnitDTO | null>(null);

  useEffect(() => {
    const fetchUnits = async () => {
      const token = await getToken();
      if (!token) return;
      const units = await getUnits(token);
      setUnits(units);
    };
    void fetchUnits();
  }, [getToken]);

  const addUnit = async (unit: UnitDTOCreate) => {
    const token = await getToken();
    if (!token) return;
    const newUnit = await createUnit(token, unit);
    setUnits((prevUnits) => [...prevUnits, newUnit]);
  };

  const updateUnit = async (unit: UnitDTO) => {
    const token = await getToken();
    if (!token) return;
    const updatedUnit = await updateUnitById(token, unit);
    setUnits(units.map((u) => (u.id === unit.id ? updatedUnit : u)));
  };

  const deleteUnit = async (unitId: number) => {
    const token = await getToken();
    if (!token) return;
    await deleteUnitById(token, unitId);
    setUnits((prevUnits) => prevUnits.filter((u) => u.id !== unitId));
  };

  return (
    <UnitContext.Provider
      value={{
        units,
        setUnits,
        isUnitModalOpen,
        setIsUnitModalOpen,
        addUnit,
        updateUnit,
        deleteUnit,
        currentUnit,
        setCurrentUnit,
      }}
    >
      {children}
    </UnitContext.Provider>
  );
};

export const useUnits = () => {
  const context = useContext(UnitContext);
  if (!context) throw new Error("useUnits must be used within a UnitProvider");
  return context;
};

export default UnitProvider;
