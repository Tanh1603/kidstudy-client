/* eslint-disable import/order */
import ChallengeOptionDTO from "./ChallengeOptionDTO";
import { z } from "zod";

export const challengeType = ["SELECT", "ASSIST"] as const;

export const challengeSchema = z.object({
  id: z.number().optional(),
  lessonId: z.number().nonnegative(),
  type: z.enum(challengeType),
  question: z.string().min(1, "Question is required"),
  audioSrc: z.string().optional().nullable(),
  imageSrc: z.string().optional().nullable(),
  order: z.number(),
});

export type ChallengeForm = z.infer<typeof challengeSchema>;

type ChallengeDTO = {
  id: number;
  lessonId: number;
  type: (typeof challengeType)[number];
  question: string;
  audioSrc: string;
  imageSrc: string;
  order: number;
  completed: boolean;
  challengeOptions: ChallengeOptionDTO[];
};
export default ChallengeDTO;
