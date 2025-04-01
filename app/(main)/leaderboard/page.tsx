"use client";
import { useState } from "react";
import { useEffect } from "react";

import { useAuth } from "@clerk/nextjs";
import Image from "next/image";

import UserProgressDTO from "@/app/models/UserProgressDTO";
import { getLeaderboard, getUserProgress } from "@/app/services/user-progress";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { UserProgress } from "@/components/user-progress";




import Loading from "./loading";
const LeaderboardPage = () => {
  const { userId, getToken } = useAuth();
  const [leaderboard, setLeaderboard] = useState<UserProgressDTO[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressDTO>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const [leaderboardData, userProgressData] = await Promise.all([
          getLeaderboard(token as string, 10),
          getUserProgress(token as string, userId as string),
        ]);
        console.log(leaderboardData);

        setLeaderboard(leaderboardData);
        setUserProgress(userProgressData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [userId, getToken]);

  if (loading) return <Loading />;
  if (!userProgress) return null;

  // const [userProgress, userSubscription, leaderboard] = await Promise.all([
  //   userProgressData,
  //   userSubscriptionData,
  //   leaderboardData,
  // ]);

  // if (!userProgress || !userProgress.activeCourse) redirect("/courses");

  // const isPro = !!userSubscription?.isActive;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          // activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          // hasActiveSubscription={isPro}
          hasActiveSubscription={false}
        />
        {/* {!isPro && <Promo />} */}
        <Quests points={userProgress.points} />
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
          <p className="mb-6 text-center text-lg text-muted-foreground">
            See where you stand among other learners in the community.
          </p>

          <Separator className="mb-4 h-0.5 rounded-full" />
          {leaderboard ? (
            leaderboard.map((userProgress, i) => (
              <div
                key={userProgress.userId}
                className="flex w-full items-center rounded-xl p-2 px-4 hover:bg-gray-200/50"
              >
                <p className="mr-4 font-bold text-lime-700">{i + 1}</p>

                <Avatar className="ml-3 mr-6 h-12 w-12 border bg-green-500">
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
            <div>Không có dữ liệu</div>
          )}
        </div>
      </FeedWrapper>
    </div>
  );
};

export default LeaderboardPage;
