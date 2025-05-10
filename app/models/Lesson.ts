/* eslint-disable import/order */
import ChallengeDTO from "./ChallengeDTO";
import { z } from "zod";

export const lessonSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  unitId: z.number().nonnegative("Nonnegative"),
  order: z.number().min(1, "Order must be ≥ 1"),
});

export type LessonDTO = z.infer<typeof lessonSchema> & {
  challenges: ChallengeDTO[];
  completed: boolean;
};

export type LessonForm = z.infer<typeof lessonSchema>;

export default LessonDTO;
