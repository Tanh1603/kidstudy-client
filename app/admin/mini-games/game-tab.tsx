import {
  AnagramGameQuestion,
  DifficultyEnum,
  GameTypeEnum,
} from "@/app/models/Game";
import React from "react";
import { SortableHeader } from "../column-helpers";
import { ColumnDef } from "@tanstack/react-table";
import { useGetGameQuestionByGameType } from "@/hooks/use-game-question-hook";
import Loading from "@/components/loading";
import { TableComponent } from "@/components/table";
import { useAdminModal } from "@/store/use-admin-store";
import Image from "next/image";

type GameQuestionTabProps<T> = {
  gameType: GameTypeEnum;
  columns: ColumnDef<T>[];
};

const GameQuestionTab = <T,>({
  gameType,
  columns,
}: GameQuestionTabProps<T>) => {
  const { data, isLoading, isError } = useGetGameQuestionByGameType(gameType);

  const { onOpen } = useAdminModal();

  if (isLoading) return <Loading />;

  if (isError) return <div>Error loading anagram questions</div>;
  return (
    <TableComponent
      data={(data as T[]) ?? []}
      columns={columns}
      onOpenModal={() => onOpen("unit", "create")}
    />
  );
};

export default GameQuestionTab;
