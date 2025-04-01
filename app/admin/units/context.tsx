/* eslint-disable import/order */
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import UnitDTO, { UnitDTOCreate } from "@/app/models/UnitDTO";
import { useAuth } from "@clerk/nextjs";
import { getUnits } from "@/app/services/admin/units";

interface UnitContextType {
  units: UnitDTO[];
  setUnits: (units: UnitDTO[]) => void;
  isUnitModalOpen: boolean;
  currentUnit: UnitDTO | null;
  setCurrentUnit: (unit: UnitDTO | null) => void;
  setIsUnitModalOpen: (isUnitModalOpen: boolean) => void;
  addUnit: (unit: UnitDTOCreate) => void;
  updateUnit: (unit: UnitDTO) => void;
  deleteUnit: (id: number) => void;
}

const UnitContext = createContext<UnitContextType>({
  units: [],
  setUnits: () => {},
  isUnitModalOpen: false,
  currentUnit: null,
  setCurrentUnit: () => {},
  setIsUnitModalOpen: () => {},
  addUnit: () => {},
  updateUnit: () => {},
  deleteUnit: () => {},
});

export const UnitProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();

  const [units, setUnits] = useState<UnitDTO[]>([]);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [currentUnit, setCurrentUnit] = useState<UnitDTO | null>(null);
  const addUnit = (unit: UnitDTOCreate) => {
    setUnits([...units, unit as UnitDTO]);
  };

  useEffect(() => {
    const fetchUnits = async () => {
      const token = await getToken();
      if (!token) return;
      const units = await getUnits(token);
      setUnits(units);
    };
    void fetchUnits();
  }, [getToken]);

  const updateUnit = (unit: UnitDTO) => {
    setUnits(units.map((u) => (u.id === unit.id ? unit : u)));
  };

  const deleteUnit = (id: number) => {
    setUnits(units.filter((u) => u.id !== id));
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
