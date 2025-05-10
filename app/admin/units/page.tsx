/* eslint-disable import/order */
"use client";
import UnitDTO from "@/app/models/UnitDTO";
import { TableComponent } from "@/components/table";
import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "../column-helpers";
import { ActionCellHelper } from "../dropdown-helper";
import { useAdminModal } from "@/store/use-admin-store";
import { useUnit } from "@/hooks/use-unit-hook";
import Loading from "@/components/loading";
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
  const { data, isLoading } = useUnit();
  const { onOpen } = useAdminModal();

  if (isLoading) return <Loading />;

  return (
    <TableComponent
      data={data ?? []}
      columns={columns}
      onOpenModal={() => onOpen("unit", "create")}
    />
  );
};

export default UnitsPage;
