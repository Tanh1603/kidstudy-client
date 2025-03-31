type ChallengeOptionDTO = {
  id: number;
  challengeId: number;
  text: string;
  correct: boolean;
  imageSrc: string;
  audioSrc: string;
};

export default ChallengeOptionDTO;
