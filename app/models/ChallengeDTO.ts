import ChallengeOptionDTO from "./ChallengeOptionDTO";

type ChallengeDTO = {
  id: number;
  lessonId: number;
  type: string;
  question: string;
  audioSrc: string;
  order: number;
  completed: boolean;
  challengeOptions: ChallengeOptionDTO[];
};

type ChallengeDTOCreate = Omit<
  ChallengeDTO,
  "id" | "completed" | "challengeOptions"
>;
export type { ChallengeDTOCreate };
export default ChallengeDTO;
