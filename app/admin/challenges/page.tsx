/* eslint-disable import/order */
"use client";
import { useState } from "react";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import ChallengeDTO from "@/app/models/ChallengeDTO";
import { getChallenges } from "@/app/services/admin/challenges";
import { TableComponent } from "@/components/table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { SortableHeader } from "../column-helpers";
const columns: ColumnDef<ChallengeDTO>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="id" />,
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
];
const ChallengesPage = () => {
  const { getToken } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeDTO[]>([]);

  useEffect(() => {
    const fetchChallenges = async () => {
      const token = await getToken();
      if (!token) {
        return;
      }
      const challenges = await getChallenges(token);
      setChallenges(challenges);
    };
    void fetchChallenges();
  }, [getToken]);

  return <TableComponent data={challenges} columns={columns} />;
};

export default ChallengesPage;
