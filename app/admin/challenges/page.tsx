/* eslint-disable import/order */
"use client";
import { useState } from "react";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import ChallengeDTO from "@/app/models/ChallengeDTO";
import { getChallenges } from "@/app/services/admin/challenges";
import { TableComponent } from "@/components/table";
import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "../column-helpers";
import { ActionCellHelper } from "../dropdown-helper";
import { useChallenges } from "./context";
import UpsertChallengeModal from "./upsert";
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
    accessorKey: "lessonId",
    header: ({ column }) => <SortableHeader column={column} title="lessonId" />,
  },
  {
    accessorKey: "type",
    header: ({ column }) => <SortableHeader column={column} title="type" />,
  },
  {
    accessorKey: "question",
    header: ({ column }) => <SortableHeader column={column} title="question" />,
  },
  {
    accessorKey: "audioSrc",
    header: ({ column }) => <SortableHeader column={column} title="audioSrc" />,
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
  const { challenges, isChallengeModalOpen, setIsChallengeModalOpen } =
    useChallenges();

  return (
    <>
      <TableComponent
        data={challenges}
        columns={columns}
        onOpenModal={() => setIsChallengeModalOpen(true)}
      />
      <UpsertChallengeModal
        isOpen={isChallengeModalOpen}
        onCloseModal={() => setIsChallengeModalOpen(false)}
      />
    </>
  );
};

export default ChallengesPage;
