/* eslint-disable import/order */
"use client";
import { useAuth } from "@clerk/nextjs"; // import { getLesson, getUserProgress, getUserSubscription } from "@/db/queries";
import LessonDTO from "@/app/models/Lesson";
import { Quiz } from "../quiz";
import UserProgressDTO from "@/app/models/UserProgressDTO";
import { useEffect, useState } from "react";
import { getUserProgress } from "@/app/services/user-progress";
import { getUserLessonById } from "@/app/services/lesson-service";
type LessonIdPageProps = {
  params: {
    lessonId: number;
  };
};

const LessonIdPage = ({ params }: LessonIdPageProps) => {
  // const lessonData = getLesson(params.lessonId);
  // const userProgressData = getUserProgress();
  // const userSubscriptionData = getUserSubscription();

  // const [lesson, userProgress, userSubscription] = await Promise.all([
  //   lessonData,
  //   userProgressData,
  //   userSubscriptionData,
  // ]);

  // if (!lesson || !userProgress) return redirect("/learn");

  const { userId, getToken } = useAuth();
  const [lesson, setLesson] = useState<LessonDTO>();
  const [userProgress, setUserProgress] = useState<UserProgressDTO>();

  useEffect(() => {
    const fetchData = async () => {
      const token = (await getToken()) as string;
      const lesson = await getUserLessonById(
        token,
        params.lessonId,
        userId as string
      );
      const userProgress = await getUserProgress(token, userId as string);
      setLesson(lesson);
      setUserProgress(userProgress);
    };
    void fetchData();
  }, [getToken, params.lessonId, userId]);

  if (!lesson || !userProgress) return;
  const initialPercentage =
    (lesson?.challenges.filter((challenge) => challenge.completed).length /
      lesson?.challenges.length) *
    100;

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges}
      initialHearts={userProgress.hearts}
      initialPercentage={initialPercentage}
      // userSubscription={userSubscription}
    />
  );
};

export default LessonIdPage;
