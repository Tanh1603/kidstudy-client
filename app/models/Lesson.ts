import ChallengeDTO from "./ChallengeDTO";

type LessonDTO = {
  id: number;
  title: string;
  unitId: number;
  order: number;
  challenges: ChallengeDTO[];
  completed: boolean;
};

type LessonDTOCreate = Omit<LessonDTO, "id" | "completed" | "challenges">;
export type { LessonDTOCreate };
export default LessonDTO;
