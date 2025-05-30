"use client";

import TopicPage from "./topic-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameQuestionTab from "./game-tab";
import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "../column-helpers";
import {
  AnagramGameQuestion,
  GameTypeEnum,
  MatchUpGameQuestion,
  MemoryGameQuestion,
  MemoryGameQuestionWithAudio,
  MemoryGameQuestionWithImageAndAudio,
  MemoryGameQuestionWithWord,
  SpellingBeeGameQuestion,
} from "@/app/models/Game";
import Image from "next/image";

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
    cell: ({ row }) => {
      const imageSrc = row.original.imageSrc;
      return (
        <div className="flex items-center justify-center">
          {imageSrc ? (
            <div className="relative h-[60px] w-full overflow-hidden rounded border">
              <Image
                src={imageSrc}
                alt="imageSrc"
                fill
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-contain"
              />
            </div>
          ) : (
            <span>No Image</span>
          )}
        </div>
      );
    },
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
    cell: ({ row }) => {
      const imageSrc = row.original.imageSrc;
      return (
        <div className="flex items-center justify-center">
          {imageSrc ? (
            <div className="relative h-[60px] w-full overflow-hidden rounded border">
              <Image
                src={imageSrc}
                alt="imageSrc"
                fill
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-contain"
              />
            </div>
          ) : (
            <span>No Image</span>
          )}
        </div>
      );
    },
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
    id: "audioSrc", // dùng id thay cho accessorKey vì không phải bản ghi nào cũng có
    header: ({ column }) => <SortableHeader column={column} title="audioSrc" />,
    cell: ({ row }) => {
      const audioSrc = (
        row.original as
          | MemoryGameQuestionWithAudio
          | MemoryGameQuestionWithImageAndAudio
      ).audioSrc;
      return audioSrc ? (
        <audio controls src={audioSrc} className="max-w-full" />
      ) : (
        <span>No Audio</span>
      );
    },
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
    cell: ({ row }) => {
      const question = row.original;
      // Kiểm tra các loại có imageSrc
      if (
        "imageSrc" in question &&
        (question.memoryType === "WORD_IMAGE" ||
          question.memoryType === "IMAGE_AUDIO")
      ) {
        return (
          <div className="flex items-center justify-center">
            <div className="relative h-[60px] w-[60px] overflow-hidden rounded border">
              <Image
                src={question.imageSrc}
                alt="image"
                fill
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-contain"
              />
            </div>
          </div>
        );
      }
      return <span>No Image</span>;
    },
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
  },

  {
    accessorKey: "imageSrc",
    header: ({ column }) => <SortableHeader column={column} title="imageSrc" />,
    cell: ({ row }) => {
      const imageSrc = row.original.imageSrc;
      return (
        <div className="flex items-center justify-center">
          {imageSrc ? (
            <div className="relative h-[60px] w-full overflow-hidden rounded border">
              <Image
                src={imageSrc}
                alt="imageSrc"
                fill
                sizes="(max-width: 640px) 100vw, 640px"
                className="object-contain"
              />
            </div>
          ) : (
            <span>No Image</span>
          )}
        </div>
      );
    },
  },
];

const Page = () => {
  return (
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
  );
};

export default Page;
