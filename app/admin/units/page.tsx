/* eslint-disable import/order */
"use client";
import UnitDTO from "@/app/models/UnitDTO";
import { getUnits } from "@/app/services/admin/units";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { TableComponent } from "@/components/table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { SortableHeader } from "../column-helpers";

const columns: ColumnDef<UnitDTO>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="id" />,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column} title="title" />,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <SortableHeader column={column} title="description" />
    ),
  },
  {
    accessorKey: "order",
    header: ({ column }) => <SortableHeader column={column} title="order" />,
  },
];

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

  return <TableComponent data={units} columns={columns} />;
};

export default UnitsPage;
