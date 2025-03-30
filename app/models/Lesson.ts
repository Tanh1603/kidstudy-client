import ChallengeDTO from "./ChallengeDTO";

type LessonDTO = {
  id: number;
  title: string;
  unitId: number;
  order: number;
  challenges: ChallengeDTO[];   
  completed: boolean;
};

export default LessonDTO;
