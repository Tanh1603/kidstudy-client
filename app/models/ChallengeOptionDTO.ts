type ChallengeOptionDTO = {
  id: number;
  challengeId: number;
  text: string;
  correct: boolean;
  imageSrc: string;
  audioSrc: string;
};

type ChallengeOptionDTOCreate = Omit<ChallengeOptionDTO, "id">;
export type { ChallengeOptionDTOCreate };
export default ChallengeOptionDTO;
