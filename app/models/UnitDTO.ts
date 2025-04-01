import LessonDTO from "./Lesson";

type UnitDTO = {
  id: number;
  title: string;
  description: string;
  order: number;
  lessons: LessonDTO[];
};
export type UnitDTOCreate = Omit<UnitDTO, "id" | "lessons">;
export default UnitDTO;
