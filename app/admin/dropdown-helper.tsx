/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/order */
"use client";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { useUnits } from "./units/context";
import UnitDTO, { UnitForm } from "../models/UnitDTO";
import LessonDTO, { LessonForm } from "../models/Lesson";
import ChallengeDTO, { ChallengeForm } from "../models/ChallengeDTO";
// import ChallengeOptionDTO from "../models/ChallengeOptionDTO";
import { toast } from "sonner";
import { useAdminModal } from "@/store/use-admin-store";
import { useDeleteUnit } from "@/hooks/use-unit-hook";
import { useDeleteLesson } from "@/hooks/use-lesson-hook";
import { useDeleteChallenge } from "@/hooks/use-challenge-hook";
import { useAuth } from "@clerk/nextjs";
import { deleteFile } from "../services/uploadFile";
import {
  AnagramGameQuestion,
  GameTypeEnum,
  MatchUpGameQuestion,
  MemoryGameQuestion,
  SpellingBeeGameQuestion,
} from "../models/Game";
import { useDeleteGameQuestion } from "@/hooks/use-game-question-hook";
export const ActionCellHelper = ({ row, type }: { row: any; type: string }) => {
  const { onOpen } = useAdminModal();
  const deleteUnit = useDeleteUnit();
  const deleteLesson = useDeleteLesson();
  const deleteChallenge = useDeleteChallenge();
  let gameType;
  switch (type) {
    case "anagram":
      gameType = GameTypeEnum.ANAGRAM;
      break;
    case "memory":
      gameType = GameTypeEnum.MEMORY;
      break;
    case "match-up":
      gameType = GameTypeEnum.MATCH_UP;
      break;
    case "spelling-bee":
      gameType = GameTypeEnum.SPELLING_BEE;
      break;
    default:
      break;
  }
  const deleteGameQuestion = useDeleteGameQuestion(
    gameType ?? GameTypeEnum.ANAGRAM
  );

  const { getToken } = useAuth();
  const handleSubmit = () => {
    if (type === "unit") {
      onOpen("unit", "update", row?.original as UnitForm);
    } else if (type === "lesson") {
      onOpen("lesson", "update", row?.original as LessonForm);
      console.log(row?.original);
    } else if (type === "challenge") {
      onOpen("challenge", "update", row?.original as ChallengeForm);
    } else if (type === "anagram") {
      onOpen("anagram", "update", row?.original as AnagramGameQuestion);
    } else if (type === "match-up") {
      onOpen("match-up", "update", row?.original as MatchUpGameQuestion);
    } else if (type === "spelling-bee") {
      onOpen(
        "spelling-bee",
        "update",
        row?.original as SpellingBeeGameQuestion
      );
    } else if (type == "memory") {
      onOpen("memory", "update", row?.original as MemoryGameQuestion);
    }
  };

  const handleDelete = async () => {
    try {
      const token = (await getToken()) as string;
      if (type === "unit") {
        const id = (row?.original as UnitDTO).id;
        if (!id) {
          toast.error("Error id");
          return;
        }
        await deleteUnit.mutateAsync(id);
      } else if (type === "lesson") {
        const lesson = row?.original as LessonDTO;
        if (!lesson.id) {
          toast.error("Error id");
          return;
        }
        await deleteLesson.mutateAsync(lesson.id);
        const lessonPromises: Promise<any>[] = [];
        lesson.challenges.map((challenge) => {
          if (challenge.audioSrc)
            lessonPromises.push(deleteFile(challenge.audioSrc, token));
          if (challenge.imageSrc)
            lessonPromises.push(deleteFile(challenge.imageSrc, token));
        });

        await Promise.all(lessonPromises);
      } else if (type === "challenge") {
        const challenge = row?.original as ChallengeDTO;
        if (!challenge.id) {
          toast.error("Error id");
          return;
        }
        const promises: Promise<any>[] = [];
        await deleteChallenge.mutateAsync(challenge.id);
        if (challenge.audioSrc) {
          promises.push(deleteFile(challenge.audioSrc, token));
        }
        if (challenge.imageSrc) {
          promises.push(deleteFile(challenge.imageSrc, token));
        }

        await Promise.all(promises);
      } else if (type === "challengeOption") {
        toast.success("Challenge option deleted successfully");
      } else if (
        type === "anagram" ||
        type === "match-up" ||
        type === "spelling-bee" ||
        type === "memory"
      ) {
        const id = row?.original?.id;
        if (!id) {
          toast.error("Error id");
          return;
        }
        await deleteGameQuestion.mutateAsync(id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting unit");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem
          onClick={handleSubmit}
          className="cursor-pointer active:bg-blue-500"
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer active:bg-red-500"
          onClick={() => void handleDelete()}
        >
          Delete
        </DropdownMenuItem>
        {type === "challenge" && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              const data = row?.original as ChallengeDTO;
              onOpen("challenge-options", "create", data.id);
            }}
          >
            Options
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
