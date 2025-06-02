/* eslint-disable import/order */
import Image from "next/image";
import { CheckCircle2, Trophy, Ticket } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import Loading from "./loading";
import { useDailyQuests } from "@/hooks/use-quest-hook";
import { cn } from "@/lib/utils";
import Error from "./error";

export const Quests = () => {
  const { data: quests, isLoading, error } = useDailyQuests();
  if (isLoading) return <Loading />;
  if (error) return <Error />;
  if (!quests || quests.length === 0) {
    return (
      <div className="rounded-xl border-2 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-neutral-800">
          Daily Quests
        </h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 rounded-full bg-neutral-100 p-4">
            <Trophy className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-neutral-700">
            No quests yet
          </h3>
          <p className="text-sm text-neutral-500">
            Come back later for new quests!
          </p>
        </div>
      </div>
    );
  }

  const totalPoints = quests.reduce((acc, quest) => acc + quest.points, 0);
  const totalTarget = quests.reduce((acc, quest) => acc + quest.target, 0);
  const totalProgress = (totalPoints / totalTarget) * 100;
  const totalRewardTickets = quests.reduce(
    (acc, quest) => acc + (quest.reward || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border-2 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-800">Daily Quests</h2>
          <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2">
            <Ticket className="h-5 w-5 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-700">
              {totalRewardTickets} tickets
            </span>
          </div>
        </div>
        <Progress value={totalProgress} className="mb-6 h-3 bg-neutral-100" />
        <ul className="w-full space-y-4">
          {quests.map((quest) => {
            const progress = (quest.points / quest.target) * 100;
            const isCompleted = quest.isCompleted;

            return (
              <div
                className={cn(
                  "flex w-full items-center gap-x-4 rounded-lg p-4 transition-all hover:shadow-md",
                  isCompleted
                    ? "border border-green-200 bg-green-50"
                    : "border border-neutral-200 bg-neutral-50"
                )}
                key={quest.title}
              >
                <div className="relative">
                  <Image
                    src="/points.svg"
                    alt="Points"
                    width={40}
                    height={40}
                    className={cn(
                      "transition-opacity",
                      isCompleted && "opacity-50"
                    )}
                  />
                  {isCompleted && (
                    <CheckCircle2
                      className="absolute -right-1 -top-1 text-green-500"
                      size={20}
                    />
                  )}
                </div>

                <div className="flex w-full flex-col gap-y-2">
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        "text-sm font-bold",
                        isCompleted ? "text-green-700" : "text-neutral-700"
                      )}
                    >
                      {quest.title}
                    </p>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isCompleted ? "text-green-600" : "text-neutral-500"
                        )}
                      >
                        {quest.points}/{quest.target} points
                      </span>
                      {quest.reward > 0 && (
                        <div className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1">
                          <Ticket className="h-3 w-3 text-neutral-600" />
                          <span className="text-xs font-medium text-neutral-700">
                            {quest.reward}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Progress
                    value={progress}
                    className={cn(
                      "h-2",
                      isCompleted ? "bg-green-100" : "bg-neutral-100"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </ul>
      </div>

      <div className="rounded-xl border-2 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-neutral-800">
          Rewards Summary
        </h2>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-neutral-700">
              Total Tickets Available
            </h3>
          </div>
          <p className="text-sm text-neutral-500">
            Complete all quests to earn {totalRewardTickets} tickets!
          </p>
        </div>
      </div>
    </div>
  );
};
