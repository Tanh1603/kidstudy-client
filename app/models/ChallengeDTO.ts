import ChallengeOptionDTO from "./ChallengeOptionDTO";

type ChallengeDTO = {
  id: number;
  type: string;
  question: string;
  audioSrc: string;
  order: number;
  completed: boolean;
  challengeOptions: ChallengeOptionDTO[];
};

export default ChallengeDTO;
