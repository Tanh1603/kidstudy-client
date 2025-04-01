/* eslint-disable import/order */
"use client";
import ChallengeOptionDTO from "@/app/models/ChallengeOptionDTO";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { getChallengeOptions } from "@/app/services/admin/challenge-options";
import { TableComponent } from "@/components/table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { SortableHeader } from "../column-helpers";
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
];

const ChallengeOptionsPage = () => {
  const { getToken } = useAuth();
  const [challengeOptions, setChallengeOptions] = useState<
    ChallengeOptionDTO[]
  >([]);

  useEffect(() => {
    const fetchChallengeOptions = async () => {
      const token = await getToken();
      if (!token) {
        return;
      }
      const challengeOptions = await getChallengeOptions(token);
      setChallengeOptions(challengeOptions);
    };
    void fetchChallengeOptions();
  }, [getToken]);

  return <TableComponent data={challengeOptions} columns={columns} />;
};

export default ChallengeOptionsPage;
