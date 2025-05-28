import { z } from "zod";

import LessonDTO from "./Lesson";

export const unitSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  order: z.number().min(1, "Order must be ≥ 1"),
});

export type UnitForm = z.infer<typeof unitSchema>;

type UnitDTO = {
  id: number;
  title: string;
  description: string;
  order: number;
  lessons: LessonDTO[];
};

export default UnitDTO;
