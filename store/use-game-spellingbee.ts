/* eslint-disable import/order */
import { create } from "zustand";
import { DifficultyEnum, SpellingBeeGameQuestion } from "@/app/models/Game";
import TopicDTO from "@/app/models/TopicDTO";

export type GameState = {
  currentScreen: "difficulty" | "topics" | "game";
  selectedDifficulty: DifficultyEnum;
  selectedTopic: TopicDTO | null;
  currentQuestionIndex: number;
  userAnswer: string;
  score: number;
  wrongAnswers: number;
  showFeedback: string;
  gameQuestions: SpellingBeeGameQuestion[];
  totalQuestions: number;
  timeLeft: number;
  isGameActive: boolean;
  showResultModal: boolean;
  gameEndReason: string;
};

const initialState: GameState = {
  currentScreen: "difficulty",
  selectedDifficulty: DifficultyEnum.EASY,
  selectedTopic: null,
  currentQuestionIndex: 0,
  userAnswer: "",
  score: 0,
  wrongAnswers: 0,
  showFeedback: "",
  gameQuestions: [],
  totalQuestions: 0,
  timeLeft: 600,
  isGameActive: false,
  showResultModal: false,
  gameEndReason: "",
};

export type GameActions = {
  setCurrentScreen: (screen: GameState["currentScreen"]) => void;
  setSelectedDifficulty: (difficulty: DifficultyEnum) => void;
  setSelectedTopic: (topic: TopicDTO | null) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setUserAnswer: (answer: string) => void;
  setScore: (score: number) => void;
  setWrongAnswers: (count: number) => void;
  setShowFeedback: (feedback: string) => void;
  setGameQuestions: (questions: SpellingBeeGameQuestion[]) => void;
  setTotalQuestions: (count: number) => void;
  setTimeLeft: (time: number) => void;
  setIsGameActive: (active: boolean) => void;
  setShowResultModal: (show: boolean) => void;
  setGameEndReason: (reason: string) => void;
  resetGame: () => void;
};

export const useSpellingBeeStore = create<GameState & GameActions>((set) => ({
  ...initialState,

  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setSelectedDifficulty: (difficulty: DifficultyEnum) =>
    set({ selectedDifficulty: difficulty }),
  setSelectedTopic: (topic) => set({ selectedTopic: topic }),
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  setUserAnswer: (answer) => set({ userAnswer: answer }),
  setScore: (score) => set({ score }),
  setWrongAnswers: (count) => set({ wrongAnswers: count }),
  setShowFeedback: (feedback) => set({ showFeedback: feedback }),
  setGameQuestions: (questions) => set({ gameQuestions: questions }),
  setTotalQuestions: (count) => set({ totalQuestions: count }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setIsGameActive: (active) => set({ isGameActive: active }),
  setShowResultModal: (show) => set({ showResultModal: show }),
  setGameEndReason: (reason) => set({ gameEndReason: reason }),

  resetGame: () => set(initialState),
}));
