/* eslint-disable import/order */
import { create } from "zustand";
import { DifficultyEnum, MemoryEnum, MemoryGameQuestion } from "@/app/models/Game";
import TopicDTO from "@/app/models/TopicDTO";

// Define the structure for a single card in the memory game
export type MemoryCard = {
  id: number; // Unique ID for this specific card instance (not the question ID)
  questionId: number; // The ID of the original MemoryGameQuestion this card is derived from
  pairId: number; // A unique ID for the pair this card belongs to
  type: 'word' | 'image' | 'audio' | 'matchText'; // What type of content this card displays
  content: string | File; // The actual content (word string, image URL/File, audio URL/File)
  isFlipped: boolean;
  isMatched: boolean;
  audioSrc?: string | File; // Optional: for cards that might play audio on flip (e.g., WORD_IMAGE where word is shown, audio plays)
};

export type GameState = {
  currentScreen: "difficulty" | "memoryType" | "topics" | "game" | "results"; // Added 'memoryType' screen
  selectedDifficulty: DifficultyEnum;
  selectedTopic: TopicDTO | null;
  memoryType: MemoryEnum | null; // New: To specify the type of memory game (word-image, word-word, etc.)
  cards: MemoryCard[]; // New: Array of all cards in the game
  flippedCards: number[]; // New: Array of IDs of currently flipped cards (max 2)
  matchedPairs: number; // New: Count of successfully matched pairs
  moves: number; // New: Count of total moves (two cards flipped = 1 move)
  score: number;
  wrongAttempts: number; // Renamed from wrongAnswers for clarity in memory game context
  showFeedback: string;
  gameQuestions: MemoryGameQuestion[]; // Now stores MemoryGameQuestion
  totalQuestions: number; // Total unique questions (pairs)
  timeLeft: number;
  isGameActive: boolean;
  showResultModal: boolean;
  gameEndReason: string;
};

const initialState: GameState = {
  currentScreen: "difficulty",
  selectedDifficulty: DifficultyEnum.EASY,
  selectedTopic: null,
  memoryType: null,
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  moves: 0,
  score: 0,
  wrongAttempts: 0,
  showFeedback: "",
  gameQuestions: [],
  totalQuestions: 0,
  timeLeft: 600, // 10 minutes
  isGameActive: false,
  showResultModal: false,
  gameEndReason: "",
};

export type GameActions = {
  setCurrentScreen: (screen: GameState["currentScreen"]) => void;
  setSelectedDifficulty: (difficulty: DifficultyEnum) => void;
  setSelectedTopic: (topic: TopicDTO | null) => void;
  setMemoryType: (type: MemoryEnum | null) => void; // New action
  setCards: (cards: MemoryCard[]) => void; // New action
  setFlippedCards: (cardIds: number[]) => void; // New action
  setMatchedPairs: (count: number) => void; // New action
  setMoves: (count: number) => void; // New action
  setScore: (score: number) => void;
  setWrongAttempts: (count: number) => void; // Updated action
  setShowFeedback: (feedback: string) => void;
  setGameQuestions: (questions: MemoryGameQuestion[]) => void; // Updated type
  setTotalQuestions: (count: number) => void;
  setTimeLeft: (time: number) => void;
  setIsGameActive: (active: boolean) => void;
  setShowResultModal: (show: boolean) => void;
  setGameEndReason: (reason: string) => void;
  resetGame: () => void;
};

export const useMemoryStore = create<GameState & GameActions>((set) => ({
  ...initialState,

  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setSelectedDifficulty: (difficulty: DifficultyEnum) =>
    set({ selectedDifficulty: difficulty }),
  setSelectedTopic: (topic) => set({ selectedTopic: topic }),
  setMemoryType: (type) => set({ memoryType: type }),
  setCards: (cards) => set({ cards }),
  setFlippedCards: (cardIds) => set({ flippedCards: cardIds }),
  setMatchedPairs: (count) => set({ matchedPairs: count }),
  setMoves: (count) => set({ moves: count }),
  setScore: (score) => set({ score }),
  setWrongAttempts: (count) => set({ wrongAttempts: count }),
  setShowFeedback: (feedback) => set({ showFeedback: feedback }),
  setGameQuestions: (questions) => set({ gameQuestions: questions }),
  setTotalQuestions: (count) => set({ totalQuestions: count }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setIsGameActive: (active) => set({ isGameActive: active }),
  setShowResultModal: (show) => set({ showResultModal: show }),
  setGameEndReason: (reason) => set({ gameEndReason: reason }),

  resetGame: () => set(initialState),
}));