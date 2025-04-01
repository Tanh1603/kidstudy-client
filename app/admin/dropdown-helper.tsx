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
import { useUnits } from "./units/context";
import { useLessons } from "./lessons/context";
import UnitDTO from "../models/UnitDTO";
import LessonDTO from "../models/Lesson";
import { useChallenges } from "./challenges/context";
import ChallengeDTO from "../models/ChallengeDTO";
import ChallengeOptionDTO from "../models/ChallengeOptionDTO";
import { useChallengeOptions } from "./challenge-options/context";
export const ActionCellHelper = ({ row, type }: { row: any; type: string }) => {
  const { setIsUnitModalOpen, setCurrentUnit } = useUnits();
  const { setIsLessonModalOpen, setCurrentLesson } = useLessons();
  const { setIsChallengeModalOpen, setCurrentChallenge } = useChallenges();
  const { setIsChallengeOptionModalOpen, setCurrentChallengeOption } =
    useChallengeOptions();
  const handleSubmit = () => {
    if (type === "unit") {
      setIsUnitModalOpen(true);
      setCurrentUnit(row?.original as UnitDTO);
    } else if (type === "lesson") {
      setIsLessonModalOpen(true);
      setCurrentLesson(row?.original as LessonDTO);
    } else if (type === "challenge") {
      setIsChallengeModalOpen(true);
      setCurrentChallenge(row?.original as ChallengeDTO);
    } else if (type === "challengeOption") {
      setIsChallengeOptionModalOpen(true);
      setCurrentChallengeOption(row?.original as ChallengeOptionDTO);
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
        <DropdownMenuItem onClick={handleSubmit} className="cursor-pointer">
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer active:bg-red-500">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
