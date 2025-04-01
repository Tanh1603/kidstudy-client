/* eslint-disable import/order */
"use client";
import LessonDTO from "@/app/models/Lesson";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { getLessons } from "@/app/services/admin/lessons";
import { TableComponent } from "@/components/table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { SortableHeader } from "../column-helpers";
const columns: ColumnDef<LessonDTO>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="id" />,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column} title="title" />,
  },
  {
    accessorKey: "unitId",
    header: ({ column }) => <SortableHeader column={column} title="unitId" />,
  },
  {
    accessorKey: "order",
    header: ({ column }) => <SortableHeader column={column} title="order" />,
  },
];
const LessonsPage = () => {
  const { getToken } = useAuth();
  const [lessons, setLessons] = useState<LessonDTO[]>([]);

  useEffect(() => {
    const fetchLessons = async () => {
      const token = await getToken();
      if (!token) {
        return;
      }
      const lessons = await getLessons(token);
      setLessons(lessons);
    };
    void fetchLessons();
  }, [getToken]);

  return <TableComponent data={lessons} columns={columns} />;
};

export default LessonsPage;
