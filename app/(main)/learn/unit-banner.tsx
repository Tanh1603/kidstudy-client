"use client";
import Link from "next/link";

import { NotebookText } from "lucide-react";


import { Button } from "@/components/ui/button";

type UnitBannerProps = {
  title: string;
  description: string;
  lessonId: number;
};

export const UnitBanner = ({ title, description, lessonId }: UnitBannerProps) => {
  return (
    <div className="flex w-full items-center justify-between rounded-xl bg-yellow-500 p-5 text-white">
      <div className="space-y-2.5">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg">{description}</p>
      </div>

      <Link href={`/lesson/${lessonId}`}>
        <Button
          size="lg"
          variant="secondary"
          className="hidden border-2 border-b-4 active:border-b-2 xl:flex"
        >
          <NotebookText className="mr-2" />
          Continue
        </Button>
      </Link>
    </div>
  );
};
