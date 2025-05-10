/* eslint-disable import/order */
"use client";

import ChallengeDTO from "@/app/models/ChallengeDTO";
import { TableComponent } from "@/components/table";
import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "../column-helpers";
import { ActionCellHelper } from "../dropdown-helper";
import { useAdminModal } from "@/store/use-admin-store";
import Loading from "@/components/loading";
import { useGetChallenge } from "@/hooks/use-challenge-hook";
import React from "react";
import UrlCell from "../url-cell";

const columns: ColumnDef<ChallengeDTO>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="id" />,
  },
  {
    accessorKey: "lessonId",
    header: ({ column }) => <SortableHeader column={column} title="lesson" />,
  },
  {
    accessorKey: "type",
    header: ({ column }) => <SortableHeader column={column} title="type" />,
  },
  {
    accessorKey: "audioSrc",
    cell: ({ row }) => <UrlCell value={row.original.audioSrc ?? null} />,
  },
  {
    accessorKey: "imageSrc",
    cell: ({ row }) => <UrlCell value={row.original.imageSrc ?? null} />,
  },

  {
    accessorKey: "order",
    header: ({ column }) => <SortableHeader column={column} title="order" />,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCellHelper row={row} type="challenge" />,
  },
];
const ChallengesPage = () => {
  const { data: challenges = [], isLoading } = useGetChallenge();
  const { onOpen } = useAdminModal();

  if (isLoading) return <Loading />;

  return (
    <TableComponent
      data={challenges}
      columns={columns}
      onOpenModal={() => onOpen("challenge", "create")}
    />
  );
};

export default ChallengesPage;
