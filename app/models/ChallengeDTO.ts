/* eslint-disable import/order */
import ChallengeOptionDTO from "./ChallengeOptionDTO";
import { z } from "zod";

export const challengeType = [
  "SELECT",
  "ASSIST",
  "LISTEN_TYPE",
  "MATCH_IMAGE",
  "REARRANGE",
  "TRANSLATE",
  "SPEAK",
] as const;

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

type ChallengeDTO = z.infer<typeof challengeSchema> & {
  completed: boolean;
  challengeOptions: ChallengeOptionDTO[];
};
export default ChallengeDTO;
