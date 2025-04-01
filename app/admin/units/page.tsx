/* eslint-disable import/order */
"use client";
import UnitDTO from "@/app/models/UnitDTO";
import { getUnits } from "@/app/services/admin/units";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { TableComponent } from "@/components/table";
import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "../column-helpers";
import { ActionCellHelper } from "../dropdown-helper";
import { useUnits } from "./context";
import UpsertUnitModal from "./upsert";
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
  {
    id: "actions",
    cell: ({ row }) => <ActionCellHelper row={row} type="unit" />,
  },
];

const UnitsPage = () => {
  const { getToken } = useAuth();
  const { units, setUnits, isUnitModalOpen, setIsUnitModalOpen, setCurrentUnit } =
    useUnits();

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
  }, [getToken, setUnits]);

  return (
    <>
      <TableComponent
        data={units}
        columns={columns}
        onOpenModal={() => setIsUnitModalOpen(true)}
      />
      <UpsertUnitModal
        isOpen={isUnitModalOpen}
        onCloseModal={() => {
          setIsUnitModalOpen(false);
          setCurrentUnit(null);
        }}
      />
    </>
  );
};

export default UnitsPage;
