"use client";
import { useEffect, useState } from "react";

import { useAuth } from "@clerk/nextjs";

import UnitDTO from "@/app/models/UnitDTO";
import UnitProgressDTO from "@/app/models/UnitProgressDTO";
import UserProgressDTO from "@/app/models/UserProgressDTO";

import { FeedWrapper } from "@/components/feed-wrapper";
// import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";

import Loading from "./loading";
import { Unit } from "./unit";
import { getUserProgress } from "@/app/services/user-progress";
import {
  getLessonPercentage,
  getFirstIncompleteLesson,
} from "@/app/services/lesson-service";
import { getUnits } from "@/app/services/unit-service";
import { getUnitProgress } from "@/app/services/unit-service";
import FirstIncompleteLessonDTO from "@/app/models/UnitProgressDTO";

const LearnPage = () => {
  const { userId, getToken } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [units, setUnits] = useState<UnitDTO[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressDTO>();
  const [firstIncompleteLesson, setFirstIncompleteLesson] =
    useState<FirstIncompleteLessonDTO>();
  const [lessonPercentage, setLessonPercentage] = useState<number>(0);
  // const userSubscriptionData = getUserSubscription();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        const [
          unitsData,
          userProgressData, //
          firstIncompleteLessonData, //
          // userSubscription,
        ] = await Promise.all([
          getUnits(token as string, userId as string),
          getUserProgress(token as string, userId as string),
          getFirstIncompleteLesson(token as string, userId as string),
          // userSubscriptionData,
        ]);
        const lessonPercentageData = await getLessonPercentage(
          token as string,
          firstIncompleteLessonData?.activeLessonId as unknown as string,
          userId as string
        );

        setUnits(unitsData);
        setUserProgress(userProgressData);
        setFirstIncompleteLesson(firstIncompleteLessonData);
        setLessonPercentage(lessonPercentageData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      void fetchData();
    }
  }, [userId]);

  if (isLoading) {
    return <Loading />;
  }
  if (!userProgress || !firstIncompleteLesson) {
    return;
  }

  // const isPro = !!userSubscription?.isActive;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          hearts={userProgress?.hearts ?? 0}
          points={userProgress?.points ?? 0}
          // hasActiveSubscription={isPro}
          hasActiveSubscription={false}
        />

        {/* {!isPro && <Promo />} */}
        <Quests points={userProgress?.points ?? 0} />
      </StickyWrapper>
      <FeedWrapper>
        {/* <Header title={userProgress.activeCourse.title} /> */}
        {units.map((unit) => (
          <div key={unit.id} className="mb-10">
            <Unit
              id={unit.id}
              order={unit.order}
              description={unit.description}
              title={unit.title}
              lessons={unit.lessons}
              activeLesson={firstIncompleteLesson.activeLesson}
              activeLessonPercentage={lessonPercentage}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
};

export default LearnPage;
