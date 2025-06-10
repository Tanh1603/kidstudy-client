/* eslint-disable import/order */
"use client";

import TopicPage from "./topic/topic-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameQuestionTab from "./game-tab";
import { ColumnDef, Row } from "@tanstack/react-table";
import { SortableHeader } from "../column-helpers";
import {
  AnagramGameQuestion,
  GameTypeEnum,
  MatchUpGameQuestion,
  MemoryEnum,
  MemoryGameQuestion,
  MemoryGameQuestionWithAudio,
  MemoryGameQuestionWithImage,
  MemoryGameQuestionWithImageAndAudio,
  // MemoryGameQuestionWithWord
  SpellingBeeGameQuestion,
} from "@/app/models/Game";
//import Image from "next/image";
//import AddAnagramQuestion from "./upsert-anagrm";
import { ActionCellHelper } from "../dropdown-helper";
import { ImageColumnHelper } from "../imag-column-helper";
import { AudioColumnHelper } from "../audio-column-helper";

// --- Type Guards ---
// These functions help TypeScript understand the specific type of MemoryGameQuestion
function isMemoryQuestionWithAudioOnly(
  question: MemoryGameQuestion
): question is MemoryGameQuestionWithAudio {
  return question.memoryType === MemoryEnum.WORD_AUDIO;
}

function isMemoryQuestionWithImageOnly(
  question: MemoryGameQuestion
): question is MemoryGameQuestionWithImage {
  return question.memoryType === MemoryEnum.WORD_IMAGE;
}

function isMemoryQuestionWithImageAndAudio(
  question: MemoryGameQuestion
): question is MemoryGameQuestionWithImageAndAudio {
  return question.memoryType === MemoryEnum.IMAGE_AUDIO;
}


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
    cell: ({ row }) => <AudioColumnHelper row={row} />, // Assuming AudioColumnHelper accepts this row type
  },

  {
    accessorKey: "imageSrc",
    header: ({ column }) => <SortableHeader column={column} title="imageSrc" />,
    cell: ({ row }) => <ImageColumnHelper row={row} />, // Assuming ImageColumnHelper accepts this row type
  },

  {
    id: "actions",
    cell: ({ row }) => <ActionCellHelper row={row} type="spelling-bee" />,
  },
];

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
    cell: ({ row }) => {
      // Check if this specific row has the audioSrc property, based on memoryType
      if (
        isMemoryQuestionWithAudioOnly(row.original) ||
        isMemoryQuestionWithImageAndAudio(row.original)
      ) {
        // TypeScript now knows row.original has audioSrc.
        // We cast `row` to ensure the AudioColumnHelper receives a row of the expected specific type.
        return <AudioColumnHelper row={row as Row<MemoryGameQuestionWithAudio>} />;
      }
      return <span>—</span>; // Display a dash if no audioSrc
    },
  },
  {
    id: "matchText",
    header: ({ column }) => (
      <SortableHeader column={column} title="Match Text" />
    ),
    cell: ({ row }) => {
      // Check if this specific row is a MemoryGameQuestionWithWord
      if (row.original.memoryType === MemoryEnum.WORD_WORD) {
        return <span>{(row.original).matchText}</span>;
      }
      return <span>—</span>;
    },
  },
  {
    id: "imageSrc",
    header: ({ column }) => <SortableHeader column={column} title="Image" />,
    cell: ({ row }) => {
      // Check if this specific row has the imageSrc property, based on memoryType
      if (
        isMemoryQuestionWithImageOnly(row.original) ||
        isMemoryQuestionWithImageAndAudio(row.original)
      ) {
        // TypeScript now knows row.original has imageSrc.
        return <ImageColumnHelper row={row as Row<MemoryGameQuestionWithImage>} />;
      }
      return <span>—</span>; // Display a dash if no imageSrc
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCellHelper row={row} type="memory" />,
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
