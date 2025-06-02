/* eslint-disable import/order */
"use client";

import Image from "next/image";

import { FeedWrapper } from "@/components/feed-wrapper";
// import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { UserProgress } from "@/components/user-progress";

import Loading from "./loading";
import { useGetLeaderboard } from "@/hooks/use-user-progress-hook";
import Error from "@/components/error";
const LeaderboardPage = () => {
  const { data: leaderboard, isLoading, error } = useGetLeaderboard();

  if (isLoading) return <Loading />;
  if (!leaderboard || error) return <Error />;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress hasActiveSubscription={false} />
        <Quests />
      </StickyWrapper>

      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <Image
            src="/leaderboard.svg"
            alt="Leaderboard"
            height={90}
            width={90}
          />

          <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
            Leaderboard
          </h1>

          <Separator className="mb-4 h-0.5 rounded-full" />
          {leaderboard ? (
            leaderboard.map((userProgress, i) => (
              <div
                key={userProgress.userId}
                className="flex w-full items-center rounded-xl p-2 px-4 hover:bg-gray-200/50"
              >
                <p className="mr-4 font-bold text-yellow-700">{i + 1}</p>

                <Avatar className="ml-3 mr-6 h-12 w-12 border bg-yellow-500">
                  <AvatarImage
                    src={userProgress.userImageSrc}
                    className="object-cover"
                  />
                </Avatar>

                <p className="flex-1 font-bold text-neutral-800">
                  {userProgress.userName ?? "Noname"}
                </p>
                <p className="text-muted-foreground">
                  {userProgress.points} XP
                </p>
              </div>
            ))
          ) : (
            <div>No data</div>
          )}
        </div>
      </FeedWrapper>
    </div>
  );
};

export default LeaderboardPage;
