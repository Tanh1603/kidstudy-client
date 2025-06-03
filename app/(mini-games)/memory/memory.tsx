/* eslint-disable import/order */
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { LucideImageOff, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { shuffleArray } from "@/lib/utils"; // Assuming you have this utility function
import { useMemoryStore, MemoryCard } from "@/store/use-game-memory"; // Import the new store
import { ResultModal } from "./results"; // Re-using the ResultModal
import { useGetRandomGameQuestionByGameType } from "@/hooks/use-game-question-hook";
import {
  GameTypeEnum,
  MemoryEnum,
  MemoryGameQuestion,
  MemoryGameQuestionWithImage,
  MemoryGameQuestionWithAudio,
  MemoryGameQuestionWithWord,
  MemoryGameQuestionWithImageAndAudio,
} from "@/app/models/Game";
import Loading from "@/components/loading";
import Image from "next/image";
import { Header } from "@/components/ui/header-game";

// Define the number of pairs for a 4x5 grid (20 cards total)
const NUMBER_OF_PAIRS_FOR_MEMORY_GAME = 10;
const CARD_FLIP_DELAY_MS = 1200; // How long non-matching cards stay flipped
const POINTS_PER_MATCH = 100;
const PENALTY_PER_WRONG_ATTEMPT = 20; // Points deducted for a wrong match

// Type guard to ensure we're working with MemoryGameQuestion
function isMemoryGameQuestion(
  question: unknown
): question is MemoryGameQuestion {
  return (
    typeof question === 'object' &&
    question !== null &&
    'gameType' in question &&
    (question as MemoryGameQuestion).gameType === GameTypeEnum.MEMORY &&
    typeof (question as MemoryGameQuestion).memoryType === 'string'
  );
}

export const MemoryGameScreen: React.FC = () => {
  const {
    score,
    timeLeft,
    isGameActive,
    selectedDifficulty,
    selectedTopic,
    memoryType, // New: Memory game type
    showResultModal,
    cards, // New: All cards for the game
    flippedCards, // New: Currently flipped cards
    matchedPairs, // New: Count of matched pairs
    moves, // New: Count of moves
    wrongAttempts, // Updated: Renamed from wrongAnswers
    setCards,
    setFlippedCards,
    setMatchedPairs,
    setMoves,
    setTimeLeft,
    setIsGameActive,
    setGameEndReason,
    setShowResultModal,
    setScore,
    setWrongAttempts,
    setShowFeedback, // To display feedback messages
    setTotalQuestions, // To set total pairs
    totalQuestions, // Total pairs
    setCurrentScreen, // To navigate back to results or other screens on game end
  } = useMemoryStore();

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);

  const { data, isLoading } = useGetRandomGameQuestionByGameType(
    GameTypeEnum.MEMORY, // Always request MEMORY game type
    selectedDifficulty,
    selectedTopic?.id ?? 0,
    NUMBER_OF_PAIRS_FOR_MEMORY_GAME // Request enough questions for pairs
  );

  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);
  const flipSoundRef = useRef<HTMLAudioElement | null>(null);

  // --- Audio Initialization ---
  useEffect(() => {
    if (!correctSoundRef.current) correctSoundRef.current = new Audio("/correct.wav");
    if (!incorrectSoundRef.current) incorrectSoundRef.current = new Audio("/incorrect.wav");
    if (!flipSoundRef.current) flipSoundRef.current = new Audio("/flip.wav");
  }, []);

  // --- Card Generation Logic ---
  const generateCardsFromQuestions = useCallback(
    (questions: MemoryGameQuestion[], selectedMemoryType: MemoryEnum): MemoryCard[] => {
      const generatedCards: MemoryCard[] = [];
      let cardIdCounter = 0;

      questions.forEach((q) => {
        const pairId = q.id; // Use question ID as pair ID

        // Card 1
        let card1: MemoryCard | null = null;
        // Card 2
        let card2: MemoryCard | null = null;

        // Use a switch statement to narrow the type based on q.memoryType
        // This ensures safe access to specific properties like 'word', 'imageSrc', 'audioSrc', 'matchText'
        let qWordImage: MemoryGameQuestionWithImage;
        let qWordAudio: MemoryGameQuestionWithAudio;
        let qImageAudio: MemoryGameQuestionWithImageAndAudio;
        let qWordWord: MemoryGameQuestionWithWord;

        switch (selectedMemoryType) {
          case MemoryEnum.WORD_IMAGE:
            // Type is narrowed to MemoryGameQuestionWithImage
            qWordImage = q as MemoryGameQuestionWithImage;
            if (qWordImage.word && qWordImage.imageSrc) {
              card1 = {
                id: cardIdCounter++,
                questionId: qWordImage.id,
                pairId,
                type: 'word',
                content: qWordImage.word,
                isFlipped: false,
                isMatched: false,
              };
              card2 = {
                id: cardIdCounter++,
                questionId: qWordImage.id,
                pairId,
                type: 'image',
                content: qWordImage.imageSrc,
                isFlipped: false,
                isMatched: false,
              };
            }
            break;
          case MemoryEnum.WORD_AUDIO:
            // Type is narrowed to MemoryGameQuestionWithAudio
            qWordAudio = q as MemoryGameQuestionWithAudio;
            if (qWordAudio.word && qWordAudio.audioSrc) {
              card1 = {
                id: cardIdCounter++,
                questionId: qWordAudio.id,
                pairId,
                type: 'word',
                content: qWordAudio.word,
                isFlipped: false,
                isMatched: false,
              };
              card2 = {
                id: cardIdCounter++,
                questionId: qWordAudio.id,
                pairId,
                type: 'audio',
                content: qWordAudio.audioSrc,
                isFlipped: false,
                isMatched: false,
              };
            }
            break;
          case MemoryEnum.IMAGE_AUDIO:
            // Type is narrowed to MemoryGameQuestionWithImageAndAudio
            qImageAudio = q as MemoryGameQuestionWithImageAndAudio;
            if (qImageAudio.imageSrc && qImageAudio.audioSrc) {
              card1 = {
                id: cardIdCounter++,
                questionId: qImageAudio.id,
                pairId,
                type: 'image',
                content: qImageAudio.imageSrc,
                isFlipped: false,
                isMatched: false,
              };
              card2 = {
                id: cardIdCounter++,
                questionId: qImageAudio.id,
                pairId,
                type: 'audio',
                content: qImageAudio.audioSrc,
                isFlipped: false,
                isMatched: false,
              };
            }
            break;
          case MemoryEnum.WORD_WORD:
            // Type is narrowed to MemoryGameQuestionWithWord
            qWordWord = q as MemoryGameQuestionWithWord;
            if (qWordWord.word && qWordWord.matchText) {
              card1 = {
                id: cardIdCounter++,
                questionId: qWordWord.id,
                pairId,
                type: 'word',
                content: qWordWord.word,
                isFlipped: false,
                isMatched: false,
              };
              card2 = {
                id: cardIdCounter++,
                questionId: qWordWord.id,
                pairId,
                type: 'matchText',
                content: qWordWord.matchText,
                isFlipped: false,
                isMatched: false,
              };
            }
            break;
          default:
            console.warn("Unsupported memory type:", selectedMemoryType);
            break;
        }

        if (card1 && card2) {
          generatedCards.push(card1, card2);
        }
      });
      return shuffleArray(generatedCards);
    },
    []
  );

  // --- Game Initialization Effect ---
  useEffect(() => {
    // Only initialize if we are on the game screen, and cards haven't been set yet
    if (
      data &&
      memoryType && // Ensure memoryType is selected
      data.length >= NUMBER_OF_PAIRS_FOR_MEMORY_GAME &&
      cards.length === 0 // Only initialize if cards are not already set
    ) {
      const memoryQuestions = data.filter(
        (q) => isMemoryGameQuestion(q) && q.memoryType === memoryType
      ) as MemoryGameQuestion[];

      // Ensure we have enough questions of the correct memory type
      if (memoryQuestions.length < NUMBER_OF_PAIRS_FOR_MEMORY_GAME) {
        setIsGameActive(false);
        setShowResultModal(true);
        setGameEndReason("not_enough_questions_for_memory_type");
        return;
      }

      // Take only the required number of questions for the game
      const selectedQuestions = memoryQuestions.slice(
        0,
        NUMBER_OF_PAIRS_FOR_MEMORY_GAME
      );

      const newCards = generateCardsFromQuestions(selectedQuestions, memoryType);

      setCards(newCards);
      setTotalQuestions(NUMBER_OF_PAIRS_FOR_MEMORY_GAME); // Total pairs
      setTimeLeft(600); // Reset time for new game
      setIsGameActive(true);
      setScore(0);
      setWrongAttempts(0);
      setMatchedPairs(0);
      setMoves(0);
      setFlippedCards([]);
      setShowFeedback("");
      setFeedbackMessage(null);
      setFeedbackType(null);
    } else if (
      !isLoading &&
      data &&
      data.length < NUMBER_OF_PAIRS_FOR_MEMORY_GAME &&
      cards.length === 0
    ) {
      setIsGameActive(false);
      setShowResultModal(true);
      setGameEndReason("not_enough_questions_available");
    }
  }, [
    data,
    isLoading,
    memoryType,
    cards.length,
    setCards,
    setTotalQuestions,
    setTimeLeft,
    setIsGameActive,
    setScore,
    setWrongAttempts,
    setMatchedPairs,
    setMoves,
    setFlippedCards,
    setShowFeedback,
    setGameEndReason,
    setShowResultModal,
    generateCardsFromQuestions,
  ]);

  // --- Game Timer Effect ---
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isGameActive && timeLeft > 0) { // Removed currentScreen === "game" check as this component is only for game screen
      timer = setInterval(() => {
        if (timeLeft <= 1) {
          setIsGameActive(false);
          setGameEndReason("timeout");
          setShowResultModal(true);
          setTimeLeft(0);
          setCurrentScreen("results"); // Navigate to results screen
        } else {
          setTimeLeft(timeLeft - 1);
        }
      }, 1000);
    } else if (!isGameActive && timeLeft === 0 && !showResultModal) {
      setGameEndReason("timeout");
      setShowResultModal(true);
      setCurrentScreen("results"); // Navigate to results screen
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGameActive, timeLeft, setIsGameActive, setGameEndReason, setShowResultModal, setTimeLeft, showResultModal, setCurrentScreen]);

  // --- Card Click Handler ---
  const handleCardClick = useCallback(
    (clickedCardId: number) => {
      if (!isGameActive || flippedCards.length === 2) {
        return; // Prevent clicks if game is inactive or two cards are already flipped
      }

      const clickedCard = cards.find((card) => card.id === clickedCardId);
      if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) {
        return; // Ignore clicks on already flipped or matched cards
      }

      flipSoundRef.current?.play().catch((err) => console.error("Flip sound error:", err));

      // Play audio content if available
      if (clickedCard.type === 'audio' && typeof clickedCard.content === 'string') {
        new Audio(clickedCard.content).play().catch(e => console.error("Audio playback error:", e));
      } else if (clickedCard.audioSrc && typeof clickedCard.audioSrc === 'string') {
        // For WORD_IMAGE or IMAGE_AUDIO where audio is secondary
        new Audio(clickedCard.audioSrc).play().catch(e => console.error("Audio playback error:", e));
      }


      // Update cards to reflect the flipped state
      const newCards = cards.map((card) =>
        card.id === clickedCardId ? { ...card, isFlipped: true } : card
      );
      setCards(newCards);

      const newFlippedCards = [...flippedCards, clickedCardId];
      setFlippedCards(newFlippedCards);

      setFeedbackMessage(null); // Clear previous feedback

      // If two cards are flipped, check for a match
      if (newFlippedCards.length === 2) {
        setMoves(moves + 1); // Increment moves after two cards are flipped
        const [card1Id, card2Id] = newFlippedCards;
        const card1 = newCards.find((c) => c.id === card1Id);
        const card2 = newCards.find((c) => c.id === card2Id);

        if (card1 && card2 && card1.pairId === card2.pairId) {
          // Match found!
          setMatchedPairs(matchedPairs + 1);
          setScore(score + POINTS_PER_MATCH);
          setFeedbackMessage("Match Found!");
          setFeedbackType('success');
          correctSoundRef.current?.play().catch((err) => console.error("Correct sound error:", err));

          // Mark cards as matched
          const updatedCardsAfterMatch = newCards.map((card) =>
            card.id === card1Id || card.id === card2Id
              ? { ...card, isMatched: true }
              : card
          );
          setCards(updatedCardsAfterMatch);
          setFlippedCards([]); // Clear flipped cards

          // Check if all pairs are matched
          if (matchedPairs + 1 === totalQuestions) {
            setIsGameActive(false);
            setGameEndReason("completed");
            setShowResultModal(true);
            setCurrentScreen("results"); // Navigate to results screen
          }
        } else {
          // No match, flip cards back after a delay
          setScore(Math.max(0, score - PENALTY_PER_WRONG_ATTEMPT)); // Deduct points, but not below 0
          setWrongAttempts(wrongAttempts + 1);
          setFeedbackMessage("No Match. Try again!");
          setFeedbackType('error');
          incorrectSoundRef.current?.play().catch((err) => console.error("Incorrect sound error:", err));

          setTimeout(() => {
            const updatedCardsAfterMismatch = newCards.map((card) =>
              card.id === card1Id || card.id === card2Id
                ? { ...card, isFlipped: false }
                : card
            );
            setCards(updatedCardsAfterMismatch);
            setFlippedCards([]); // Clear flipped cards
          }, CARD_FLIP_DELAY_MS);
        }
      }
    },
    [isGameActive, flippedCards, cards, setCards, setFlippedCards, setMoves, moves, matchedPairs, totalQuestions, score, wrongAttempts, setMatchedPairs, setScore, setWrongAttempts, setIsGameActive, setGameEndReason, setShowResultModal, setCurrentScreen]
  );

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  if (isLoading) {
    return <Loading />;
  }


  return (
    <div
      className="flex flex-col items-center w-full min-h-screen relative overflow-hidden p-4"
      style={{
        backgroundImage: "url('/animation/memory-bg.jpg')", // Ensure this path is correct
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <Header
        currentWordIndex={matchedPairs}
        totalWords={totalQuestions}
      />
      <div className="mx-auto flex max-w-7xl flex-col gap-4 p-4 sm:p-6 lg:p-8 w-full">
        {/* Header (Score, Time) */}
        <div className="flex flex-col items-center justify-between gap-2 sm:mb-2 sm:flex-row sm:gap-4">
          <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:gap-4">
            <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-blue-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
              Score: {score}
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-green-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
              Pairs Matched: {matchedPairs} / {totalQuestions}
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-red-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
              Wrong Attempts: {wrongAttempts}
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-purple-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
              Moves: {moves}
            </div>
          </div>
          <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-green-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
            Time: {formatTime(timeLeft)}
          </div>
        </div>

        {/* Feedback Message Display */}
        {feedbackMessage && (
          <motion.div
            key={feedbackMessage}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className={`mt-3 text-center text-lg sm:text-xl font-bold ${
              feedbackType === 'success' ? "text-green-600" : feedbackType === 'error' ? "text-red-600" : "text-blue-600"
            } bg-white/50 p-2 rounded-lg shadow-md`}
            aria-live="polite"
          >
            {feedbackMessage}
          </motion.div>
        )}

        {/* Memory Game Grid (4x5) */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4 py-4 w-full max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar justify-center">
          <AnimatePresence>
            {cards.map((card) => (
              <motion.div
                key={card.id}
                className={`relative aspect-square rounded-xl shadow-lg cursor-pointer transform-gpu perspective-1000
                  ${card.isMatched ? 'opacity-70 pointer-events-none' : ''}
                `}
                onClick={() => handleCardClick(card.id)}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="relative w-full h-full rounded-xl"
                  initial={false}
                  animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Card Back */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white text-4xl font-bold backface-hidden">
                    <span className="select-none">?</span>
                  </div>

                  {/* Card Front */}
                  <div className="absolute inset-0 bg-white rounded-xl flex items-center justify-center p-2 sm:p-3 text-center text-gray-800 text-lg sm:text-xl font-semibold overflow-hidden backface-hidden rotate-y-180">
                    {card.type === 'word' || card.type === 'matchText' ? (
                      <span className="break-words p-1">{String(card.content).toUpperCase()}</span>
                    ) : card.type === 'image' ? (
                      typeof card.content === 'string' ? (
                        <Image
                          src={card.content}
                          alt="Memory Card Image"
                          width={100}
                          height={100}
                          className="object-contain max-h-full max-w-full rounded-md"
                          onError={(e) => {
                            e.currentTarget.src = `https://placehold.co/100x100/CCCCCC/000000?text=Image+Error`;
                          }}
                        />
                      ) : (
                        <LucideImageOff className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" />
                      )
                    ) : card.type === 'audio' ? (
                      <Volume2 className="h-16 w-16 sm:h-20 sm:w-20 text-blue-500" />
                    ) : (
                      <span>Error</span>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <ResultModal />
    </div>
  );
};
