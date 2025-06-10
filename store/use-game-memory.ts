// store/use-memory-game-store.ts
import { create } from "zustand";

import { DifficultyEnum } from "@/app/models/Game"; // Only DifficultyEnum is relevant from Game.ts for meta-state
import TopicDTO from "@/app/models/TopicDTO";

// Define the shape of a single memory card
export type MemoryCardState = {
  id: string; // Unique ID for each card instance (e.g., generated UUID or combined ID)
  pairId: number; // ID of the original question/pair it belongs to
  contentType: "word" | "image" | "audio" | "text"; // What type of content this card shows
  content: string | File; // The actual content (word string, URL string, or File object)
  memoryType: string; // The original MemoryEnum type (e.g., "WORD_IMAGE")
  isFlipped: boolean;
  isMatched: boolean;
};

// Define the state for the Memory Game
export type MemoryGameState = {
  currentScreen: "difficulty" | "topics" | "game"; // Similar screen flow
  selectedDifficulty: DifficultyEnum;
  selectedTopic: TopicDTO | null;
  score: number;
  timeLeft: number;
  isGameActive: boolean;
  showResultModal: boolean;
  gameEndReason: string;

  // Memory Game Specific State
  cards: MemoryCardState[];
  flippedCards: string[]; // IDs of currently flipped cards (max 2)
  matchesFound: number; // Count of successfully matched pairs
  turnsTaken: number; // Count of pairs of cards flipped
};

const initialState: MemoryGameState = {
  currentScreen: "difficulty",
  selectedDifficulty: DifficultyEnum.EASY,
  selectedTopic: null,
  score: 0,
  timeLeft: 600, // Example: 10 minutes for memory game
  isGameActive: false,
  showResultModal: false,
  gameEndReason: "",

  cards: [],
  flippedCards: [],
  matchesFound: 0,
  turnsTaken: 0,
};

// Define actions for the Memory Game
export type MemoryGameActions = {
  setCurrentScreen: (screen: MemoryGameState["currentScreen"]) => void;
  setSelectedDifficulty: (difficulty: DifficultyEnum) => void;
  setSelectedTopic: (topic: TopicDTO | null) => void;
  setScore: (score: number) => void;
  setTimeLeft: (time: number) => void;
  setIsGameActive: (active: boolean) => void;
  setShowResultModal: (show: boolean) => void;
  setGameEndReason: (reason: string) => void;

  // Memory Game Specific Actions
  setCards: (cards: MemoryCardState[]) => void;
  flipCard: (cardId: string) => void;
  resetFlippedCards: () => void;
  markCardsAsMatched: (cardIds: string[]) => void;
  incrementTurns: () => void;
  incrementMatches: () => void;

  resetGame: () => void;
};

// Create the Zustand store
export const useMemoryStore = create<MemoryGameState & MemoryGameActions>(
  (set) => ({
    ...initialState,

    // Common actions
    setCurrentScreen: (screen) => set({ currentScreen: screen }),
    setSelectedDifficulty: (difficulty) =>
      set({ selectedDifficulty: difficulty }),
    setSelectedTopic: (topic) => set({ selectedTopic: topic }),
    setScore: (score) => set({ score }),
    setTimeLeft: (time) => set({ timeLeft: time }),
    setIsGameActive: (active) => set({ isGameActive: active }),
    setShowResultModal: (show) => set({ showResultModal: show }),
    setGameEndReason: (reason) => set({ gameEndReason: reason }),

    // Memory Game Specific Actions
    setCards: (cards) => set({ cards: cards }),
    flipCard: (cardId) =>
      set((state) => ({
        cards: state.cards.map((card) =>
          card.id === cardId ? { ...card, isFlipped: true } : card
        ),
        flippedCards: [...state.flippedCards, cardId],
      })),
    resetFlippedCards: () =>
      set((state) => ({
        cards: state.cards.map((card) =>
          state.flippedCards.includes(card.id) && !card.isMatched
            ? { ...card, isFlipped: false }
            : card
        ),
        flippedCards: [],
      })),
    markCardsAsMatched: (cardIds) =>
      set((state) => ({
        cards: state.cards.map((card) =>
          cardIds.includes(card.id) ? { ...card, isMatched: true } : card
        ),
        flippedCards: [], // Clear flipped cards after marking match
      })),
    incrementTurns: () =>
      set((state) => ({ turnsTaken: state.turnsTaken + 1 })),
    incrementMatches: () =>
      set((state) => ({ matchesFound: state.matchesFound + 1 })),

    resetGame: () => set(initialState),
  })
);