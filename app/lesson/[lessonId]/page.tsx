"use client";
import { useEffect, useState } from "react";

import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";

import { Quiz } from "./quiz";
import LessonDTO from "../../models/Lesson";
import UserProgressDTO from "../../models/UserProgressDTO";
import { getUserLessonById } from "../../services/lesson-service";
import { getUserProgress } from "../../services/user-progress";
import Loading from "@/components/loading";

const LessonPage = () => {
  const { userId, getToken } = useAuth();
  const [lesson, setLesson] = useState<LessonDTO | null>(null);
  const { lessonId } = useParams();
  const [userProgress, setUserProgress] = useState<UserProgressDTO | null>(
    null
  );
  // const [userSubscription, setUserSubscription] = useState<UserSubscriptionDTO | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      const lessonData = await getUserLessonById(
        token as string,
        lessonId as unknown as number,
        userId as string
      );
      const userProgressData = await getUserProgress(
        token as string,
        userId as string
      );
      // const userSubscriptionData = await getUserSubscription();

      setLesson(lessonData);
      setUserProgress(userProgressData);
      // setUserSubscription(userSubscriptionData);
    };

    if (userId) {
      void fetchData();
    }
  }, [getToken, lessonId, userId]);

  if (!lesson || !userProgress) return <Loading />;

  const initialPercentage =
    (lesson.challenges.filter((challenge) => challenge.completed).length /
      lesson.challenges.length) *
    100;

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges}
      initialHearts={userProgress.hearts}
      initialPercentage={initialPercentage}
      // userSubscription={userSubscription}
      // userSubscription={false}
    />
  );
};

export default LessonPage;
