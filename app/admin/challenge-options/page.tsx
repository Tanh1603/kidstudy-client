/* eslint-disable import/order */
"use client";
import ChallengeOptionDTO from "@/app/models/ChallengeOptionDTO";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { getChallengeOptions } from "@/app/services/admin/challenge-options";
import { TableComponent } from "@/components/table";
import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "../column-helpers";
import { ActionCellHelper } from "../dropdown-helper";
import { useChallengeOptions } from "./context";
import UpsertChallengeOptionModal from "./upsert";
const columns: ColumnDef<ChallengeOptionDTO>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="id" />,
  },
  {
    accessorKey: "challengeId",
    header: ({ column }) => (
      <SortableHeader column={column} title="challengeId" />
    ),
  },
  {
    accessorKey: "text",
    header: ({ column }) => <SortableHeader column={column} title="text" />,
  },
  {
    accessorKey: "correct",
    header: ({ column }) => <SortableHeader column={column} title="correct" />,
  },
  {
    accessorKey: "imageSrc",
    header: ({ column }) => <SortableHeader column={column} title="imageSrc" />,
  },
  {
    accessorKey: "audioSrc",
    header: ({ column }) => <SortableHeader column={column} title="audioSrc" />,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCellHelper row={row} type="challengeOption" />,
  },
];

const ChallengeOptionsPage = () => {
  const {
    challengeOptions,
    isChallengeOptionModalOpen,
    setIsChallengeOptionModalOpen,
  } = useChallengeOptions();

  return (
    <>
      <TableComponent
        data={challengeOptions}
        columns={columns}
        onOpenModal={() => setIsChallengeOptionModalOpen(true)}
      />
      <UpsertChallengeOptionModal
        isOpen={isChallengeOptionModalOpen}
        onCloseModal={() => setIsChallengeOptionModalOpen(false)}
      />
    </>
  );
};

export default ChallengeOptionsPage;
