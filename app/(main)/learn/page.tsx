"use client";
import { useEffect, useState } from "react";

import { useAuth } from "@clerk/nextjs";


import UnitDTO from "@/app/models/UnitDTO";
import FirstIncompleteLessonDTO from "@/app/models/UnitProgressDTO";
import {
  getLessonPercentage,
  getFirstIncompleteLesson,
} from "@/app/services/lesson-service";
import { getUnits } from "@/app/services/unit-service";
import { FeedWrapper } from "@/components/feed-wrapper";
// import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";

import Loading from "./loading";
import { Unit } from "./unit";

const LearnPage = () => {
  const { userId, getToken } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [units, setUnits] = useState<UnitDTO[]>([]);
  const [firstIncompleteLesson, setFirstIncompleteLesson] =
    useState<FirstIncompleteLessonDTO>();
  const [lessonPercentage, setLessonPercentage] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        const [unitsData, firstIncompleteLessonData] = await Promise.all([
          getUnits(token as string, userId as string),
          getFirstIncompleteLesson(token as string, userId as string),
        ]);
        const lessonPercentageData = await getLessonPercentage(
          token as string,
          firstIncompleteLessonData?.activeLessonId as unknown as string,
          userId as string
        );

        setUnits(unitsData);
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
  }, [getToken, userId]);

  if (isLoading) {
    return <Loading />;
  }
  if (!firstIncompleteLesson) return;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress hasActiveSubscription={false} />

        <Quests />
      </StickyWrapper>
      <FeedWrapper>
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
