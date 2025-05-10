import { z } from "zod";

export const challengeOptionsSchema = z.object({
  id: z.number().optional(),
  challengeId: z.number().nonnegative(),
  text: z.string().min(1, "Text is required"),
  correct: z.boolean(),
  imageSrc: z.string().optional().nullable(),
  audioSrc: z.string().optional().nullable(),
});
type ChallengeOptionDTO = z.infer<typeof challengeOptionsSchema>;

export default ChallengeOptionDTO;
