type QuestDTO = {
  id: number;
  title: string;
  reward: number;
  targetPoints: number;
};

type QuestUserDTO = {
  id: number;
  questId: number;
  title: string;
  points: number;
  target: number;
  isCompleted: boolean;
  reward: number;
};

export type { QuestUserDTO };
export default QuestDTO;
