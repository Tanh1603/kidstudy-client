"use client";
import React, { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { LucideImageOff, Volume2 } from "lucide-react";

import { GameTypeEnum, SpellingBeeGameQuestion } from "@/app/models/Game";
import Loading from "@/components/loading";
import { useGetRandomGameQuestionByGameType } from "@/hooks/use-game-question-hook";
import { useSpellingBeeStore } from "@/store/use-game-spellingbee";

import { Keyboard } from "./keyboard";
import { ResultModal } from "./results";

export const GameScreen: React.FC = () => {
  const {
    currentQuestionIndex,
    userAnswer,
    showFeedback,
    score,
    timeLeft,
    isGameActive,
    selectedDifficulty,
    selectedTopic,
    setTimeLeft,
    setIsGameActive,
    setGameEndReason,
    setShowResultModal,
    setUserAnswer,
    setScore,
    setWrongAnswers,
    setShowFeedback,
    setCurrentQuestionIndex,
    wrongAnswers,
  } = useSpellingBeeStore();

  const correctAnswers = Math.floor(score / 10); // Calculate correct answers from score

  const { data, isLoading } = useGetRandomGameQuestionByGameType(
    GameTypeEnum.SPELLING_BEE,
    selectedDifficulty,
    selectedTopic?.id ?? 0,
    20
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameQuestions = data as SpellingBeeGameQuestion[];
  const currentQuestion =
    gameQuestions && currentQuestionIndex < gameQuestions.length
      ? gameQuestions[currentQuestionIndex]
      : null;

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  useEffect(() => {
    if (data && data.length > 0) {
      setTimeLeft(600); // Reset timer when game starts
      setIsGameActive(true);
    }
  }, [data, setTimeLeft, setIsGameActive]);

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
  }, [
    isGameActive,
    timeLeft,
    setIsGameActive,
    setGameEndReason,
    setShowResultModal,
    setTimeLeft,
  ]);

  useEffect(() => {
    if (
      currentQuestion?.audioSrc &&
      typeof currentQuestion.audioSrc === "string"
    ) {
      const audio = new Audio(currentQuestion.audioSrc);
      audioRef.current = audio;
    }
    // Initialize sound effects
    correctSoundRef.current = new Audio("/correct.wav");
    incorrectSoundRef.current = new Audio("/incorrect.wav");
  }, [currentQuestion?.audioSrc]);

  if (isLoading || !data || data.length === 0) return <Loading />;

  if (!currentQuestion) return null;

  const handleKeyPress = (letter: string) => {
    if (showFeedback || !isGameActive) return;

    const newAnswer = userAnswer + letter;
    setUserAnswer(newAnswer);

    if (newAnswer.length === currentQuestion.word.length) {
      if (
        newAnswer.toLocaleLowerCase() ===
        currentQuestion.word.toLocaleLowerCase()
      ) {
        setScore(score + 10);
        setShowFeedback("correct");
        correctSoundRef.current?.play().catch((err) => console.error(err));
      } else {
        setWrongAnswers(wrongAnswers + 1);
        setShowFeedback("incorrect");
        setShowCorrectAnswer(true);
        incorrectSoundRef.current?.play().catch((err) => console.error(err));
      }

      setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          if (currentQuestionIndex < gameQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setUserAnswer("");
            setShowFeedback("");
            setShowCorrectAnswer(false);
            setIsTransitioning(false);
          } else {
            setIsGameActive(false);
            setGameEndReason("completed");
            setShowResultModal(true);
          }
        }, 500);
      }, 1500);
    }
  };

  const handleBackspace = () => {
    if (showFeedback || !isGameActive) return;
    setUserAnswer(userAnswer.slice(0, -1));
  };

  const playAudio = () => {
    audioRef.current?.play().catch((err) => console.error(err));
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center"
      style={{
        backgroundImage: "url('/animation/anagram-bg.jpg')",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
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
          {/* Question Display */}
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
                  width={80}
                  height={80}
                  className={`h-30 w-30 md:h-50 transform transition-all duration-500 hover:scale-110 sm:h-40 sm:w-40 md:w-32 ${
                    isTransitioning
                      ? "rotate-180 scale-0"
                      : "rotate-0 scale-100"
                  }`}
                />
              ) : (
                <LucideImageOff
                  className={`h-16 w-16 transform transition-all duration-500 hover:scale-110 sm:h-24 sm:w-24 md:h-32 md:w-32 ${
                    isTransitioning
                      ? "rotate-180 scale-0"
                      : "rotate-0 scale-100"
                  }`}
                />
              )}
            </div>
            <button
              onClick={playAudio}
              className="rounded-full border-2 border-gray-300 bg-white/90 p-2 transition-all duration-300 hover:scale-110 hover:bg-gray-50 hover:shadow-lg sm:p-3"
            >
              <Volume2 size={20} className="sm:h-6 sm:w-6" />
              <audio ref={audioRef} />
            </button>
          </div>

          {/* Answer Display */}
          <div className="text-center">
            <div
              className={`mb-4 flex flex-wrap justify-center gap-1 transition-all duration-500 sm:gap-2 ${
                isTransitioning
                  ? "translate-y-8 scale-95 opacity-0"
                  : "translate-y-0 scale-100 opacity-100"
              }`}
            >
              {Array.from({ length: currentQuestion.word.length }).map(
                (_, index) => (
                  <div
                    key={index}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 ${
                      showCorrectAnswer && showFeedback === "incorrect"
                        ? "border-red-500 bg-red-100/90"
                        : "border-gray-300 bg-white/90"
                    } text-center text-2xl font-bold shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg sm:h-16 sm:w-16 sm:text-3xl`}
                  >
                    {showCorrectAnswer && showFeedback === "incorrect"
                      ? currentQuestion.word[index].toUpperCase()
                      : (userAnswer[index] || "").toUpperCase()}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Keyboard */}
          <div
            className={`px-2 transition-all duration-500 sm:px-4 ${
              isTransitioning ? "scale-95 opacity-50" : "scale-100 opacity-100"
            }`}
          >
            <Keyboard
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
              disabled={!isGameActive}
            />
          </div>
        </div>

        {/* Result Modal */}
        <ResultModal />
      </div>
    </div>
  );
};
