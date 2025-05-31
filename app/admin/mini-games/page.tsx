/* eslint-disable import/order */
"use client";

import TopicPage from "./topic/topic-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameQuestionTab from "./game-tab";
import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "../column-helpers";
import {
  AnagramGameQuestion,
  GameTypeEnum,
  MatchUpGameQuestion,
  MemoryEnum,
  MemoryGameQuestion,
  MemoryGameQuestionWithAudio,
  MemoryGameQuestionWithImageAndAudio,
  MemoryGameQuestionWithWord,
  SpellingBeeGameQuestion,
} from "@/app/models/Game";
import Image from "next/image";
import AddAnagramQuestion from "./upsert-anagrm";
import { ActionCellHelper } from "../dropdown-helper";
import { ImageColumnHelper } from "../imag-column-helper";
import { AudioColumnHelper } from "../audio-column-helper";

const anagramColumns: ColumnDef<AnagramGameQuestion>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="id" />,
  },
  {
    accessorKey: "topicId",
    header: ({ column }) => <SortableHeader column={column} title="topicId" />,
  },
  {
    accessorKey: "difficulty",
    header: ({ column }) => (
      <SortableHeader column={column} title="difficulty" />
    ),
  },
  {
    accessorKey: "word",
    header: ({ column }) => <SortableHeader column={column} title="word" />,
  },
  {
    accessorKey: "imageSrc",
    header: ({ column }) => <SortableHeader column={column} title="imageSrc" />,
    cell: ({ row }) => <ImageColumnHelper row={row} />,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCellHelper row={row} type="anagram" />,
  },
];

const matchUpColumns: ColumnDef<MatchUpGameQuestion>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="id" />,
  },
  {
    accessorKey: "topicId",
    header: ({ column }) => <SortableHeader column={column} title="topicId" />,
  },
  {
    accessorKey: "difficulty",
    header: ({ column }) => (
      <SortableHeader column={column} title="difficulty" />
    ),
  },
  {
    accessorKey: "word",
    header: ({ column }) => <SortableHeader column={column} title="word" />,
  },
  {
    accessorKey: "imageSrc",
    header: ({ column }) => <SortableHeader column={column} title="imageSrc" />,
    cell: ({ row }) => <ImageColumnHelper row={row} />,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCellHelper row={row} type="match-up" />,
  },
];

const memoryColumns: ColumnDef<MemoryGameQuestion>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="ID" />,
  },
  {
    accessorKey: "topicId",
    header: ({ column }) => <SortableHeader column={column} title="Topic ID" />,
  },
  {
    accessorKey: "difficulty",
    header: ({ column }) => (
      <SortableHeader column={column} title="Difficulty" />
    ),
  },
  {
    accessorKey: "word",
    header: ({ column }) => <SortableHeader column={column} title="Word" />,
  },
  {
    accessorKey: "memoryType",
    header: ({ column }) => (
      <SortableHeader column={column} title="Memory Type" />
    ),
  },
  {
    id: "audioSrc",
    header: ({ column }) => <SortableHeader column={column} title="audioSrc" />,
    cell: ({ row }) => <AudioColumnHelper row={row} />,
  },
  {
    id: "matchText",
    header: ({ column }) => (
      <SortableHeader column={column} title="Match Text" />
    ),
    cell: ({ row }) => {
      const matchText = (row.original as MemoryGameQuestionWithWord).matchText;
      return matchText ? <span>{matchText}</span> : <span>—</span>;
    },
  },
  {
    id: "imageSrc",
    header: ({ column }) => <SortableHeader column={column} title="Image" />,
    cell: ({ row }) => <ImageColumnHelper row={row} />,
  },

  {
    id: "actions",
    cell: ({ row }) => <ActionCellHelper row={row} type="memory" />,
  },
];

const spellingBeeColumns: ColumnDef<SpellingBeeGameQuestion>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="id" />,
  },
  {
    accessorKey: "topicId",
    header: ({ column }) => <SortableHeader column={column} title="topicId" />,
  },
  {
    accessorKey: "difficulty",
    header: ({ column }) => (
      <SortableHeader column={column} title="difficulty" />
    ),
  },
  {
    accessorKey: "word",
    header: ({ column }) => <SortableHeader column={column} title="word" />,
  },

  {
    accessorKey: "audioSrc",
    header: ({ column }) => <SortableHeader column={column} title="audioSrc" />,
    cell: ({ row }) => <AudioColumnHelper row={row} />,
  },

  {
    accessorKey: "imageSrc",
    header: ({ column }) => <SortableHeader column={column} title="imageSrc" />,
    cell: ({ row }) => <ImageColumnHelper row={row} />,
  },

  {
    id: "actions",
    cell: ({ row }) => <ActionCellHelper row={row} type="spelling-bee" />,
  },
];

const Page = () => {
  return (
    <div>
      <div className="flex p-4">
        <Tabs defaultValue="Anagram" className="w-full">
          <TabsList>
            <TabsTrigger value="Anagram">Anagram</TabsTrigger>
            <TabsTrigger value="MatchUp">Match Up</TabsTrigger>
            <TabsTrigger value="Memory">Memory</TabsTrigger>
            <TabsTrigger value="SpellingBee">SpellingBee</TabsTrigger>
            <TabsTrigger value="Topic">Topic</TabsTrigger>
          </TabsList>

          <TabsContent value="Anagram">
            <GameQuestionTab
              columns={anagramColumns}
              gameType={GameTypeEnum.ANAGRAM}
            />
          </TabsContent>
          <TabsContent value="MatchUp">
            <GameQuestionTab
              columns={matchUpColumns}
              gameType={GameTypeEnum.MATCH_UP}
            />
          </TabsContent>
          <TabsContent value="Memory">
            {" "}
            <GameQuestionTab
              columns={memoryColumns}
              gameType={GameTypeEnum.MEMORY}
            />
          </TabsContent>
          <TabsContent value="SpellingBee">
            <GameQuestionTab
              columns={spellingBeeColumns}
              gameType={GameTypeEnum.SPELLING_BEE}
            />
          </TabsContent>
          <TabsContent value="Topic">
            <TopicPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
