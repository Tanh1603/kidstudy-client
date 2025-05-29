/* eslint-disable import/order */
// components/header.tsx
'use client';

import { X } from "lucide-react";
import { useExitModal } from "@/store/use-exit-modal";
// 👈 UPDATED IMPORT: From 'progressbar' to 'ui/progress' and imported by name
import { Progress } from "@/components/ui/progress";

interface HeaderProps {
  currentWordIndex: number;
  totalWords: number;
}

export const Header = ({ currentWordIndex, totalWords }: HeaderProps) => {
  const { open } = useExitModal();

  // Calculate the progress percentage (0-100)
  const progressValue = totalWords > 0 ? (currentWordIndex / totalWords) * 100 : 0;

  return (
    <header className="mx-auto mb-8 flex w-full max-w-[1140px] items-center justify-between gap-x-7 px-10 pt-[20px] lg:pt-[50px]">
      <X
        onClick={open}
        className="cursor-pointer text-slate-500 transition hover:opacity-75 h-5 w-5"
      />
      <div className="flex-grow">
        {/* 👈 UPDATED COMPONENT USAGE: Pass 'value' prop */}
        <Progress value={progressValue} />
      </div>
    </header>
  );
};