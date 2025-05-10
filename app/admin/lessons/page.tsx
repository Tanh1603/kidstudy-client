/* eslint-disable import/order */
"use client";
import LessonDTO from "@/app/models/Lesson";
import { TableComponent } from "@/components/table";
import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "../column-helpers";
import { ActionCellHelper } from "../dropdown-helper";
import { useGetLesson } from "@/hooks/use-lesson-hook";
import Loading from "@/components/loading";
import { useAdminModal } from "@/store/use-admin-store";
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
  const { data, isLoading } = useGetLesson();
  const { onOpen } = useAdminModal();

  if (isLoading) return <Loading />;

  return (
    <TableComponent
      data={data ?? []}
      columns={columns}
      onOpenModal={() => onOpen("lesson", "create")}
    />
  );
};

export default LessonsPage;
