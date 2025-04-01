/* eslint-disable import/order */
"use client";
import UnitDTO from "@/app/models/UnitDTO";
import { getUnits } from "@/app/services/admin/units";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { TableComponent } from "@/components/table";
const UnitsPage = () => {
  const { getToken } = useAuth();
  const [units, setUnits] = useState<UnitDTO[]>([]);

  useEffect(() => {
    const fetchUnits = async () => {
      const token = await getToken();
      if (!token) {
        return;
      }
      const units = await getUnits(token);
      setUnits(units);
    };
    void fetchUnits();
  }, [getToken]);

  return (
    <TableComponent
      headers={["id", "title", "description", "order"]}
      data={units.map((unit) => ({
        id: unit.id.toString(),
        title: unit.title,
        description: unit.description,
        order: unit.order,
      }))}
    />
  );
};

export default UnitsPage;
