"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";

import Image from "next/image";

import { motion, AnimatePresence, Reorder } from "framer-motion";

import { LucideImageOff} from "lucide-react";

import * as Game from "@/app/models/Game";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header-game";
import { useGetRandomGameQuestionByGameType } from "@/hooks/use-game-question-hook";
import { shuffleArray } from "@/lib/utils";
import { useAnagramStore } from "@/store/use-game-anagram"; // Your Zustand store

import { ResultModal } from "./results"; // Re-using ResultModal - MOVED HERE


interface DraggableLetter {
  letter: string;
  originalIndex: number; // For internal tracking if needed
  id: string; // Unique ID for Framer Motion Reorder.Item
}

export const GameScreen: React.FC = () => {
  const {
    currentQuestionIndex,
    userAnswer, // This will store the JSON.stringified array of DraggableLetter
    showFeedback,
    score,
    timeLeft,
    isGameActive,
    selectedDifficulty,
    selectedTopic,
    showResultModal,
    setTimeLeft,
    setIsGameActive,
    setGameEndReason,
    setShowResultModal,
    setUserAnswer, // Will now update the JSON.stringified array
    setScore,
    setWrongAnswers,
    setShowFeedback,
    setCurrentQuestionIndex,
    wrongAnswers,
    // Assuming these exist in your store for total questions
    setTotalQuestions,
    totalQuestions,
    gameQuestions, // Assuming this is also managed by the store now
    setGameQuestions,
  } = useAnagramStore();

  const correctAnswers = Math.floor(score / 10); // Calculate correct answers from score

  // Fetch questions using your hook
  const { data, isLoading } = useGetRandomGameQuestionByGameType(
    Game.GameTypeEnum.ANAGRAM,
    selectedDifficulty,
    selectedTopic?.id ?? 0,
    5
  );

  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);
  const currentQuestion =
  gameQuestions && currentQuestionIndex < gameQuestions.length
    ? gameQuestions[currentQuestionIndex]
    : null;

  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initial game setup and question loading handler
  useEffect(() => {
    if (data && data.length > 0 && gameQuestions.length === 0) {
      // Data arrived and store is empty, so initialize game
      setGameQuestions(data as Game.AnagramGameQuestion[]);
      setTotalQuestions(data.length);
      setTimeLeft(600); // Set initial timer (e.g., 10 minutes)
      setIsGameActive(true);
      setCurrentQuestionIndex(0); // Ensure starting from the first question
      setShowFeedback(""); // Clear feedback
    } else if (!isLoading && data && data.length === 0 && gameQuestions.length === 0) {
      // Loading finished, no data returned, and no questions in store
      // This is the true "no words available" scenario at game start
      setIsGameActive(false);
      setShowResultModal(true);
      setGameEndReason("no_words_available");
    }
  }, [data, setGameQuestions, setTotalQuestions, setTimeLeft, setIsGameActive, setCurrentQuestionIndex, setShowFeedback, gameQuestions.length, isLoading, setShowResultModal, setGameEndReason]);


  
  // Parse userAnswer string from Zustand store into an array of letter objects
  const userAnswerLetters: DraggableLetter[] = useMemo(() => {
    try {
      return JSON.parse(userAnswer || '[]') as DraggableLetter[];
    } catch (e) {
      console.error('Failed to parse userAnswer JSON from store:', e);
      return [];
    }
  }, [userAnswer]);


  // Effect to initialize/reset scrambled letters for the current question
  useEffect(() => {
    if (currentQuestion && isGameActive) {
      const scrambledLetters = shuffleArray(currentQuestion.word.split(''));
      const initialLetters: DraggableLetter[] = scrambledLetters.map((letter, index) => ({
        letter,
        originalIndex: index,
        id: `${currentQuestion.id}-${index}-${letter}-${Date.now()}`, // Ensure unique ID for Reorder
      }));
      setUserAnswer(JSON.stringify(initialLetters)); // Store as JSON string in Zustand
      setShowFeedback(""); // Clear feedback for new question
    }
  }, [currentQuestionIndex, currentQuestion, isGameActive, setUserAnswer, setShowFeedback]);

  // --- Timer Logic ---
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null; // Initialize as null
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
    } else if (!isGameActive && timeLeft === 0 && !showResultModal) {
      setGameEndReason("timeout");
      setShowResultModal(true);
    }

    return () => {
      if (timer) clearInterval(timer); // Clear interval only if it was set
    };
  }, [isGameActive, timeLeft, setIsGameActive, setGameEndReason, setShowResultModal, setTimeLeft, showResultModal]);

  // --- Audio Setup ---
  useEffect(() => {
    // Only initialize sound effects once
    if (!correctSoundRef.current) {
      correctSoundRef.current = new Audio("/correct.wav");
    }
    if (!incorrectSoundRef.current) {
      incorrectSoundRef.current = new Audio("/incorrect.wav");
    }


  }, []); // Re-run if audio source changes

  // --- Handle Answer Submission ---
  const handleSubmit = useCallback(() => {
    if (showFeedback || !isGameActive || !currentQuestion) return;

    const userWord = userAnswerLetters.map((item) => item.letter).join(''); // Join letters from reordered array

    if (userWord.toLocaleLowerCase() === currentQuestion.word.toLocaleLowerCase()) {
      setScore(score + 10);
      setShowFeedback("correct");
      correctSoundRef.current?.play().catch((err) => console.error("Correct sound error:", err));
    } else {
      setWrongAnswers(wrongAnswers + 1);
      setShowFeedback("incorrect");
      incorrectSoundRef.current?.play().catch((err) => console.error("Incorrect sound error:", err));
    }

    // Short delay to show feedback before transitioning
    setTimeout(() => {
      setIsTransitioning(true); // Start transition animation
      setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) { // Use totalQuestions from store
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          // setUserAnswer and setShowFeedback will be handled by the useEffect for currentQuestion
          setIsTransitioning(false); // End transition
        } else {
          // Game completed
          setIsGameActive(false);
          setGameEndReason("completed");
          setShowResultModal(true);
        }
      }, 500); // Duration of the exit animation
    }, 1500); // Duration to display feedback
  }, [
    userAnswerLetters,
    showFeedback,
    isGameActive,
    currentQuestion,
    setScore,
    setShowFeedback,
    setWrongAnswers,
    wrongAnswers,
    currentQuestionIndex,
    totalQuestions,
    setCurrentQuestionIndex,
    setIsGameActive,
    setGameEndReason,
    setShowResultModal,
    score,
  ]);

  // --- Callback for Framer Motion Reorder.Group ---
  const handleReorder = useCallback((newOrder: DraggableLetter[]) => {
    setUserAnswer(JSON.stringify(newOrder)); // Update Zustand store with new order
  }, [setUserAnswer]);


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  // --- Loading State and Early Exit ---
  if (isLoading) {
    return <Loading />;
  }

  // Handle the case where no questions are returned by the hook
  if (!data || data.length === 0) {
      // This will only be reached if isLoading is false AND data is empty.
      // The useEffect above will handle setting game end reason and modal.
      return (
          <div className="flex items-center justify-center min-h-screen text-2xl text-white">
              No game questions available. Please try a different selection.
          </div>
      );
  }

  // Ensure currentQuestion is available before rendering main game UI
  if (!currentQuestion) {
    return (
        <div className="flex items-center justify-center min-h-screen text-2xl text-white">
            Game completed or no more questions!
        </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center w-full min-h-screen relative"
      style={{
        backgroundImage: "url('/animation/anagram-bg.jpg')",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <Header
        currentWordIndex={currentQuestionIndex}
        totalWords={gameQuestions.length}
      />
      {/* Increased max-w-4xl to max-w-6xl for a bigger game area */}
      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 sm:p-6 lg:p-8"> {/* Added padding for better spacing */}
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-2 sm:mb-2 sm:flex-row sm:gap-4">
          <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:gap-4">
            <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-blue-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
              Score: {score}
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-green-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
              Correct: {correctAnswers}
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-red-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
              Wrong: {wrongAnswers}
            </div>
          </div>
          <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-green-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
            Time: {formatTime(timeLeft)}
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Question Display (Image & Audio Button) */}
          <div
            className={`rounded-3xl bg-gradient-to-br ${
              showFeedback === "correct"
                ? "from-green-200/90 to-green-100/70"
                : showFeedback === "incorrect"
                  ? "from-red-200/90 to-red-100/70"
                  : "from-white/90 to-white/70"
            } p-4 text-center shadow-lg backdrop-blur-sm transition-all duration-500 hover:shadow-xl sm:p-8 ${
              isTransitioning
                ? "-translate-x-full rotate-12 opacity-0"
                : "translate-x-0 rotate-0 opacity-100"
            }`}
          >
            <div className="mb-4 flex items-center justify-center">
              {currentQuestion.imageSrc ? (
                <Image
                  src={
                    typeof currentQuestion.imageSrc === "string"
                      ? currentQuestion.imageSrc
                      : URL.createObjectURL(currentQuestion.imageSrc)
                  }
                  alt={currentQuestion.word}
                  width={120} // Increased width
                  height={120} // Increased height
                  className={`h-40 w-40 transform transition-all duration-500 hover:scale-110 sm:h-60 sm:w-60 md:h-70 md:w-70 ${
                    isTransitioning
                      ? "rotate-180 scale-0"
                      : "rotate-0 scale-100"
                  }`}
                />
              ) : (
                <LucideImageOff
                  className={`h-24 w-24 transform transition-all duration-500 hover:scale-110 sm:h-32 sm:w-32 md:h-40 md:w-40 ${
                    isTransitioning
                      ? "rotate-180 scale-0"
                      : "rotate-0 scale-100"
                  }`}
                />
              )}
            </div>
          </div>

          {/* Answer Display using Reorder.Group for drag and drop */}
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id} // Key off question ID to re-trigger AnimatePresence on question change
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delayChildren: 0.1, // Stagger children animations
                  staggerChildren: 0.05,
                }}
                className={`flex flex-wrap justify-center gap-1 sm:gap-2 mb-6 p-3 border-2 border-dashed border-gray-300 rounded-md transition-all duration-500 ${
                  isTransitioning
                    ? 'translate-y-8 scale-95 opacity-0'
                    : 'translate-y-0 scale-100 opacity-100'
                }`}
              >
                <Reorder.Group
                  axis="x"
                  values={userAnswerLetters}
                  onReorder={handleReorder}
                  // Changed 'flex-nowrap' to 'flex-wrap' and removed 'overflow-x-auto'
                  className="flex flex-wrap justify-center gap-1 sm:gap-2 min-h-[50px]"
                >
                  {userAnswerLetters.map((item) => (
                    <Reorder.Item
                      key={item.id}
                      value={item}
                      drag
                      whileDrag={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-blue-400 bg-blue-500 text-white text-center text-2xl font-bold shadow-md backdrop-blur-sm cursor-grab flex-shrink-0 sm:h-16 sm:w-16 sm:text-3xl"
                    >
                      {item.letter.toUpperCase()}
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Buttons (Submit & Reset) */}
          <div className="flex justify-center gap-4 mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
              }}
              whileTap={{ scale: 0.9, rotate: 3 }}
            >
              <Button
                onClick={handleSubmit}
                variant={"super"}
                className="text-lg sm:text-xl px-6 py-2 sm:px-8 sm:py-3"
                disabled={!isGameActive || showFeedback !== ''} // Disable if game not active or feedback is showing
              >
                Submit
              </Button>
            </motion.div>

          </div>

          {/* Feedback */}
          {showFeedback === "correct" && (
            <div className="mt-3 text-lg sm:text-xl text-green-500 font-bold" aria-live="polite">
              Correct!
            </div>
          )}
          {showFeedback === "incorrect" && (
            <div className="mt-3 text-lg sm:text-xl text-red-500 font-bold" aria-live="polite">
              Try Again!
            </div>
          )}
        </div>

        {/* Result Modal */}
        <ResultModal />
      </div>
    </div>
  );
};