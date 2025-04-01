/* eslint-disable import/order */
"use client";
import LessonDTO from "@/app/models/Lesson";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { getLessons } from "@/app/services/admin/lessons";
import { TableComponent } from "@/components/table";
import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "../column-helpers";
import { ActionCellHelper } from "../dropdown-helper";
import { useLessons } from "./context";
import UpsertLessonModal from "./upsert";
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
  {
    id: "actions",
    cell: ({ row }) => <ActionCellHelper row={row} type="lesson" />,
  },
];
const LessonsPage = () => {
  const { lessons, setIsLessonModalOpen, isLessonModalOpen } = useLessons();

  return (
    <>
      <TableComponent
        data={lessons}
        columns={columns}
        onOpenModal={() => setIsLessonModalOpen(true)}
      />
      <UpsertLessonModal
        isOpen={isLessonModalOpen}
        onCloseModal={() => setIsLessonModalOpen(false)}
      />
    </>
  );
};

export default LessonsPage;
