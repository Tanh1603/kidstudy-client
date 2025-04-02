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
import { toast } from "sonner";
export const ActionCellHelper = ({ row, type }: { row: any; type: string }) => {
  const { setIsUnitModalOpen, setCurrentUnit, deleteUnit } = useUnits();
  const { setIsLessonModalOpen, setCurrentLesson, deleteLesson } = useLessons();
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

  const handleDelete = async () => {
    try {
      if (type === "unit") {
        await deleteUnit((row?.original as UnitDTO).id);
        toast.success("Unit deleted successfully");
      } else if (type === "lesson") {
        await deleteLesson((row?.original as LessonDTO).id);
        toast.success("Lesson deleted successfully");
      } else if (type === "challenge") {
        // await deleteChallenge((row?.original as ChallengeDTO).id);
        toast.success("Challenge deleted successfully");
      } else if (type === "challengeOption") {
        // await deleteChallengeOption((row?.original as ChallengeOptionDTO).id);
        toast.success("Challenge option deleted successfully");
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
        <DropdownMenuItem onClick={handleSubmit} className="cursor-pointer">
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer active:bg-red-500"
          onClick={() => void handleDelete()}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
