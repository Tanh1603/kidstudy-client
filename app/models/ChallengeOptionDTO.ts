import { z } from "zod";

export const challengeOptionsSchema = z.object({
  id: z.number().optional(),
  challengeId: z.number().nonnegative(),
  text: z.string().min(1, "Text is required"),
  correct: z.boolean(),
  imageSrc: z.string().optional(),
  audioSrc: z.string().optional(),
});

export type ChallengeOptionForm = z.infer<typeof challengeOptionsSchema>;

type ChallengeOptionDTO = {
  id: number;
  challengeId: number;
  text: string;
  correct: boolean;
  imageSrc: string;
  audioSrc: string;
};

export default ChallengeOptionDTO;
