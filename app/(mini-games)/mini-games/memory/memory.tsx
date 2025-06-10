/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";
import React, { useEffect, useRef, useCallback } from "react";

import Image from "next/image"; // Import Image component for card content

import { motion, AnimatePresence } from "framer-motion";

import { Lightbulb, Volume2 } from 'lucide-react'; // Import Lightbulb and Volume2 icons


import * as Game from "@/app/models/Game";
import Loading from "@/components/loading";
import { useGetRandomGameQuestionByGameType } from "@/hooks/use-game-question-hook"; // Your existing hook
import { useMemoryStore, MemoryCardState } from "@/store/use-game-memory"; // Use the NEW Memory Game store

import { ResultModal } from "./results"; // Your existing ResultModal

// --- Card Component Definition (Adapted from your MemoryCard and integrated framer-motion) ---
interface CardProps {
  id: string;
  contentType: MemoryCardState['contentType'];
  content: MemoryCardState['content'];
  isFlipped: boolean;
  isMatched: boolean;
  onClick: (cardId: string) => void;
  memoryType: Game.MemoryEnum;
}

// Define common transition properties for a smoother spring animation
const flipTransition = {
  type: "spring",
  stiffness: 300, // Controls the "strength" of the spring. Higher = faster to target.
  damping: 25,    // Controls how much the spring oscillates. Lower = more bouncy.
  mass: 1,        // Controls the weight of the animating element. Higher = slower to react.
};

const Card: React.FC<CardProps> = ({
  id,
  contentType,
  content,
  isFlipped,
  isMatched,
  onClick,
  memoryType,
}) => {
  // Ref for the audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper to determine image alt text
  const getImageAltText = () => {
    switch (memoryType) {
      case Game.MemoryEnum.WORD_IMAGE:
        return `Image for word: ${typeof content === 'string' ? content : JSON.stringify(content)}`;
      case Game.MemoryEnum.IMAGE_AUDIO:
        return `Image for audio pair`;
      default:
        return "Memory Card Image";
    }
  };

  // Function to play audio when the icon is clicked
  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip when clicking audio icon
    if (audioRef.current) {
      audioRef.current.play().catch(error => console.error("Audio playback failed:", error));
    }
  };

  return (
    <motion.div
      className={`relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36
                  rounded-xl shadow-lg cursor-pointer transform transition-all duration-300
                  ${isMatched ? 'opacity-0 scale-90 pointer-events-none' : 'scale-100'}` // Fade out and shrink matched cards
                }
      onClick={() => onClick(id)}
      style={{ perspective: 1000 }} // Required for 3D transforms
      whileHover={{ scale: isMatched ? 0.9 : 1.05 }} // Slight scale on hover, but not if matched
      initial={{ opacity: 0, scale: 0.8 }} // Initial state for entry animation
      animate={{ opacity: 1, scale: 1 }} // Animate to visible state
      exit={{ opacity: 0, scale: 0.8 }} // Exit animation for matched cards (handled by AnimatePresence in parent)
      transition={{ duration: 0.3 }} // Transition for initial/exit opacity/scale
    >
      {/* Card Front (Content) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl backface-hidden border-2 border-blue-300 overflow-hidden p-1 sm:p-2" // Added overflow-hidden and responsive padding
        animate={{ rotateY: isFlipped ? 0 : 180 }}
        transition={flipTransition}
        style={{ zIndex: isFlipped ? 2 : 1 }} // Ensure flipped card is on top
      >
        {contentType === 'image' ? (
          // Using next/image for optimized images
          <Image
            src={content as string} // content is string for image paths
            alt={getImageAltText()}
            width={96} // Base width, actual size controlled by parent and objectFit
            height={96} // Base height, actual size controlled by parent and objectFit
            objectFit="contain"
            className="w-full h-full rounded-lg" // Make image fill its container
          />
        ) : contentType === 'word' || contentType === 'text' ? (
          <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-blue-800 uppercase text-center p-1 break-words leading-tight flex-grow flex items-center justify-center min-w-0">
            {content as string}
          </span>
        ) : contentType === 'audio' ? (
          // Display audio icon and player for audio content
          <div className="flex flex-col items-center justify-center w-full h-full p-1 sm:p-2">
            {/* Audio icon that plays the audio */}
            <Volume2
              className="w-1/2 h-1/2 text-blue-600 cursor-pointer hover:text-blue-800 transition-colors"
              onClick={playAudio} // Play audio on click
            />
            {/* Hidden audio element for playback */}
            <audio ref={audioRef} className="hidden"> {/* Added ref and hidden class */}
              <source src={content as string} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : null}
      </motion.div>

      {/* Card Back (Cover) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl text-white font-bold text-3xl backface-hidden border-2 border-yellow-700"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={flipTransition}
        style={{ zIndex: isFlipped ? 1 : 2 }} // Ensure back is on top when not flipped
      >
        <Lightbulb className="w-12 h-12 text-yellow-100 drop-shadow-md" />
      </motion.div>
    </motion.div>
  );
};
// --- End Card Component Definition ---


// --- Helper for creating Memory Cards from fetched data ---
// This logic processes the raw API questions into the MemoryCardState format
const generateMemoryCards = (
  questions: Game.MemoryGameQuestion[]
): Array<MemoryCardState> => {
  const newCards: Array<MemoryCardState> = [];
  questions.forEach((question) => {
    const pairId = question.id; // Use question ID as pair ID

    if (question.memoryType === Game.MemoryEnum.WORD_IMAGE) {
      const q = question as unknown as Game.MemoryGameQuestionWithImage;
      newCards.push({
        id: `${pairId}-word`, // Unique ID for card 1 (e.g., "123-word")
        pairId: pairId,
        contentType: "word",
        content: q.word,
        memoryType: Game.MemoryEnum.WORD_IMAGE,
        isFlipped: false,
        isMatched: false,
      });
      newCards.push({
        id: `${pairId}-image`, // Unique ID for card 2 (e.g., "123-image")
        pairId: pairId,
        contentType: "image",
        content: q.imageSrc,
        memoryType: Game.MemoryEnum.WORD_IMAGE,
        isFlipped: false,
        isMatched: false,
      });
    } else if (question.memoryType === Game.MemoryEnum.WORD_AUDIO) {
      const q = question as unknown as Game.MemoryGameQuestionWithAudio;
      newCards.push({
        id: `${pairId}-word`,
        pairId: pairId,
        contentType: "word",
        content: q.word,
        memoryType: Game.MemoryEnum.WORD_AUDIO,
        isFlipped: false,
        isMatched: false,
      });
      newCards.push({
        id: `${pairId}-audio`,
        pairId: pairId,
        contentType: "audio",
        content: q.audioSrc,
        memoryType: Game.MemoryEnum.WORD_AUDIO,
        isFlipped: false,
        isMatched: false,
      });
    } else if (question.memoryType === Game.MemoryEnum.IMAGE_AUDIO) {
      const q = question as unknown as Game.MemoryGameQuestionWithImageAndAudio;
      newCards.push({
        id: `${pairId}-image`,
        pairId: pairId,
        contentType: "image",
        content: q.imageSrc,
        memoryType: Game.MemoryEnum.IMAGE_AUDIO,
        isFlipped: false,
        isMatched: false,
      });
      newCards.push({
        id: `${pairId}-audio`,
        pairId: pairId,
        contentType: "audio",
        content: q.audioSrc,
        memoryType: Game.MemoryEnum.IMAGE_AUDIO,
        isFlipped: false,
        isMatched: false,
      });
    } else if (question.memoryType === Game.MemoryEnum.WORD_WORD) {
      const q = question as unknown as Game.MemoryGameQuestionWithWord;
      newCards.push({
        id: `${pairId}-word1`,
        pairId: pairId,
        contentType: "word",
        content: q.word,
        memoryType: Game.MemoryEnum.WORD_WORD,
        isFlipped: false,
        isMatched: false,
      });
      newCards.push({
        id: `${pairId}-word2`,
        pairId: pairId,
        contentType: "text", // Use 'text' to differentiate from original 'word' if needed
        content: q.matchText,
        memoryType: Game.MemoryEnum.WORD_WORD,
        isFlipped: false,
        isMatched: false,
      });
    }
  });
  return newCards.sort(() => Math.random() - 0.5); // Shuffle cards randomly
};

const MemoryGameScreen: React.FC = () => {
  const {
    selectedDifficulty,
    selectedTopic,
    score,
    timeLeft,
    isGameActive,

    cards,
    flippedCards,
    matchesFound,
    turnsTaken,
    setScore,
    setTimeLeft,
    setIsGameActive,
    setShowResultModal,
    setGameEndReason,
    setCards,
    flipCard,
    resetFlippedCards,
    markCardsAsMatched,
    incrementTurns,
    incrementMatches,
  } = useMemoryStore();

  const { data, isLoading } = useGetRandomGameQuestionByGameType(
    Game.GameTypeEnum.MEMORY, // Explicitly request MEMORY game questions
    selectedDifficulty,
    selectedTopic?.id ?? 0,
    10 // Request 10 unique questions (which will generate 20 cards)
  );

  // Refs for sound effects
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize sound effects
  useEffect(() => {
    if (!correctSoundRef.current) {
      correctSoundRef.current = new Audio("/correct.wav");
    }
    if (!incorrectSoundRef.current) {
      incorrectSoundRef.current = new Audio("/incorrect.wav");
    }
  }, []);

  // --- Game Initialization Effect ---
  useEffect(() => {
    if (isLoading || !data || data.length === 0) return;

    // Cast `data` to the expected MemoryGameQuestion type
    const memoryQuestions = data as Game.MemoryGameQuestion[];
    const generatedCards = generateMemoryCards(memoryQuestions);
    setCards(generatedCards);
    setTimeLeft(600); // Set initial game time (e.g., 10 minutes)
    setIsGameActive(true);
  }, [data, isLoading, setCards, setTimeLeft, setIsGameActive]);

  // --- Timer Logic ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGameActive && timeLeft > 0) {
      timer = setInterval(() => {
        if (timeLeft <= 1) {
          setIsGameActive(false);
          setGameEndReason("timeout");
          setShowResultModal(true);
          setTimeLeft(0);
        } else {
          setTimeLeft(timeLeft - 1);
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isGameActive, timeLeft, setIsGameActive, setGameEndReason, setShowResultModal, setTimeLeft]);

  // --- Game Completion Check (New Effect based on `matchesFound` from other example) ---
  useEffect(() => {
    const totalPairs = data ? data.length : 0;
    if (matchesFound === totalPairs && totalPairs > 0) {
      setIsGameActive(false);
      setGameEndReason("completed");
      setShowResultModal(true);
    }
  }, [matchesFound, data, setIsGameActive, setGameEndReason, setShowResultModal]);


  // --- Card Click Handler ---
  const handleCardClick = useCallback(
    (cardId: string) => {
      // Prevent clicks if game not active, or two cards are already flipped
      if (!isGameActive || flippedCards.length === 2) {
        return;
      }

      const clickedCard = cards.find((card) => card.id === cardId);
      // Prevent clicking already flipped or matched cards
      if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) {
        return;
      }

      // Flip the clicked card in the store
      flipCard(cardId);

      // Add the currently flipped card to the list of flipped cards
      const newFlippedCards = [...flippedCards, cardId];

      if (newFlippedCards.length === 2) {
        // Increment turns only when a pair has been attempted
        incrementTurns();

        const [card1Id, card2Id] = newFlippedCards;
        // Access state directly from `useMemoryGameStore.getState()` for freshest values
        const currentCards = useMemoryStore.getState().cards;
        const card1 = currentCards.find((c) => c.id === card1Id);
        const card2 = currentCards.find((c) => c.id === card2Id);

        if (card1 && card2 && card1.pairId === card2.pairId) {
          // Match found!
          correctSoundRef.current?.play().catch((err) => console.error(err));
          markCardsAsMatched([card1.id, card2.id]); // Mark as matched in store
          incrementMatches(); // Increment matched pairs count
          setScore(score + 10); // Example scoring: +10 points per match

          // The game completion check is now handled by the separate useEffect
          // to ensure it reacts to the `matchesFound` state update
        } else {
          // No match
          incorrectSoundRef.current?.play().catch((err) => console.error(err));
          // Reset flipped cards after a short delay
          setTimeout(() => {
            resetFlippedCards();
          }, 1000);
        }
      }
    },
    [isGameActive, flippedCards, cards, flipCard, incrementTurns, markCardsAsMatched, incrementMatches, setScore, score, resetFlippedCards]
  );

  if (isLoading || !data || data.length === 0) {
    return <Loading />;
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  const totalPairs = data ? data.length : 0; // Number of original questions = total pairs
  const remainingPairs = totalPairs - matchesFound;

  return (
    <div
      className="flex flex-col items-center w-full min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url('/animation/anagram-bg2.jpg')`, // Changed background image
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 w-full">
        {/* Header for Memory Game */}
        <div className="flex flex-col items-center justify-between gap-2 sm:mb-2 sm:flex-row sm:gap-4">
          <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:gap-4">
            <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-blue-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
              Score: {score}
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-green-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
              Pairs Left: {remainingPairs}
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-red-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
              Turns: {turnsTaken}
            </div>
          </div>
          <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-green-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
            Time: {formatTime(timeLeft)}
          </div>
        </div>

        {/* Main Game Area - Card Grid */}
        <div className="flex justify-center items-center flex-1 py-4">
          {/* Changed grid-cols-4 to grid-cols-5 for a 4x5 layout */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
            <AnimatePresence> {/* AnimatePresence allows exit animations for removed components */}
              {cards.map((card) => (
                <Card
                  key={card.id}
                  id={card.id}
                  contentType={card.contentType}
                  content={card.content}
                  isFlipped={card.isFlipped}
                  isMatched={card.isMatched}
                  onClick={handleCardClick}
                  memoryType={card.memoryType as Game.MemoryEnum}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Result Modal (Common) */}
        <ResultModal />
      </div>
    </div>
  );
};

export default MemoryGameScreen;
  