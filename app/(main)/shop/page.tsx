"use client";
import { useEffect, useState } from "react";

import {  useAuth } from "@clerk/nextjs";
import Image from "next/image";

import UserProgressDTO from "@/app/models/UserProgressDTO";
import { getUserProgress } from "@/app/services/user-progress";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";

import { Items } from "./items";
import Loading from "./loading";


const ShopPage = () => {
  const { userId, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgressDTO>();

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const userProgressData = await getUserProgress(
          token as string,
          userId as string
        );
        setUserProgress(userProgressData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    void fetchUserProgress();
  }, [userId, getToken]);

  if (!userProgress) return null;
  if (loading) return <Loading />;
  // const userProgressData = getUserProgress();
  // const userSubscriptionData = getUserSubscription();

  // const [userProgress, userSubscription] = await Promise.all([
  //   userProgressData,
  //   userSubscriptionData,
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

        <Quests points={userProgress.points} />
      </StickyWrapper>

      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <Image src="/shop.svg" alt="Shop" height={90} width={90} />

          <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
            Shop
          </h1>
          {/* <p className="mb-6 text-center text-lg text-muted-foreground">
            Spend your points on cool stuff.
          </p> */}

          <Items
            userProgress={userProgress}
            setUserProgress={setUserProgress}
            hearts={userProgress.hearts}
            points={userProgress.points}
            // hasActiveSubscription={isPro}
            hasActiveSubscription={false}
          />
        </div>
      </FeedWrapper>
    </div>
  );
};

export default ShopPage;
