'use client';

import { X } from "lucide-react";
import { useRouter } from "next/navigation"; // Import useRouter
import { Progress } from "@/components/ui/progress";

interface HeaderProps {
  currentWordIndex: number;
  totalWords: number;
}

export const Header = ({ currentWordIndex, totalWords }: HeaderProps) => {
  const router = useRouter(); // Initialize useRouter

  // Calculate the progress percentage (0-100)
  const progressValue = totalWords > 0 ? (currentWordIndex / totalWords) * 100 : 0;

  const handleExitClick = () => {
    router.push("/mini-games"); // Navigate to the home page
  };

  return (
    // ADDED 'relative z-20' here
    <header className="mx-auto mb-8 flex w-full max-w-[1140px] items-center justify-between gap-x-7 px-10 pt-[20px] lg:pt-[50px] relative z-20">
      <X
        onClick={handleExitClick} // Use the new handler
        className="cursor-pointer text-gray-800 transition hover:scale-110 h-7 w-7"
      />
      <div className="flex-grow">
        <Progress value={progressValue} />
      </div>
    </header>
  );
};