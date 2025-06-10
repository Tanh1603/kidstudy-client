import { Column } from "@tanstack/react-table";

import { ArrowUpDown } from "lucide-react";

export function SortableHeader<TData, TValue>({
  column,
  title,
}: {
  column: Column<TData, TValue>;
  title: string;
}) {
  return (
    <button
      className="flex items-center"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </button>
  );
}
