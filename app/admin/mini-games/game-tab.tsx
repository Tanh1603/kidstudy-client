/* eslint-disable import/order */
"use client";
import { GameTypeEnum } from "@/app/models/Game";
import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useGetGameQuestionByGameType } from "@/hooks/use-game-question-hook";
import Loading from "@/components/loading";
import { TableComponent } from "@/components/table";
import { useAdminModal } from "@/store/use-admin-store";

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

  if (isLoading) return (
    <div className="h-[80vh]">
      <Loading />
    </div>
  );

  if (isError) return <div>Error loading anagram questions</div>;
  return (
    <TableComponent
      data={(data as T[]) ?? []}
      columns={columns}
      onOpenModal={() => {
        switch (gameType) {
          case GameTypeEnum.ANAGRAM:
            onOpen("anagram", "create");
            break;
          case GameTypeEnum.MATCH_UP:
            onOpen("match-up", "create");
            break;
          case GameTypeEnum.MEMORY:
            onOpen("memory", "create");
            break;
          case GameTypeEnum.SPELLING_BEE:
            onOpen("spelling-bee", "create");
            break;
          default:
            break;
        }
      }}
    />
  );
};

export default GameQuestionTab;
