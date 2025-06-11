"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";

import Image from "next/image";

import { motion, AnimatePresence, PanInfo } from "framer-motion";

import { LucideImageOff } from "lucide-react";


import { GameTypeEnum, GameQuestion, MatchUpGameQuestion } from "@/app/models/Game";
import Loading from "@/components/loading";
import { Header } from "@/components/ui/header-game";
import { useGetRandomGameQuestionByGameType } from "@/hooks/use-game-question-hook";
import { shuffleArray } from "@/lib/utils";
import { useMatchUpStore } from "@/store/use-game-matchup";

import { ResultModal } from "./results";


const NUMBER_OF_QUESTIONS_FOR_MATCHING_GAME = 8;

function isMatchUpQuestion(question: GameQuestion): question is MatchUpGameQuestion {
  return question.gameType === GameTypeEnum.ANAGRAM && typeof (question as unknown as MatchUpGameQuestion).word === 'string';
}

export const GameScreen: React.FC = () => {
  const {
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
    setScore,
    setWrongAnswers,
    wrongAnswers,
    gameQuestions,
    setGameQuestions,
  } = useMatchUpStore();

  const [userMatches, setUserMatches] = useState<Map<number, string>>(new Map());
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  const dropZoneRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const questionsMap = useRef<Map<number, MatchUpGameQuestion>>(new Map());

  const [isDragging, setIsDragging] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);

  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const { data, isLoading } = useGetRandomGameQuestionByGameType(
    GameTypeEnum.ANAGRAM,
    selectedDifficulty,
    selectedTopic?.id ?? 0,
    NUMBER_OF_QUESTIONS_FOR_MATCHING_GAME
  );

  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!correctSoundRef.current) {
      correctSoundRef.current = new Audio("/correct.wav");
    }
    if (!incorrectSoundRef.current) {
      incorrectSoundRef.current = new Audio("/incorrect.wav");
    }
  }, []);

  useEffect(() => {
    if (data && data.length === NUMBER_OF_QUESTIONS_FOR_MATCHING_GAME && gameQuestions.length === 0) {
      const matchupQuestions = data.filter(isMatchUpQuestion);

      if (matchupQuestions.length === NUMBER_OF_QUESTIONS_FOR_MATCHING_GAME) {
        setGameQuestions(matchupQuestions);

        questionsMap.current.clear();
        matchupQuestions.forEach(q => questionsMap.current.set(q.id, q));

        const allCorrectWords = matchupQuestions.map(q => q.word);
        setWordOptions(shuffleArray(allCorrectWords));
        setUserMatches(new Map());
        setTimeLeft(600);
        setIsGameActive(true);
        setScore(0);
        setWrongAnswers(0);
        setFeedbackMessage(null);
        setFeedbackType(null);
        setSelectedWord(null);
      } else {
        // Not enough valid SpellingBee questions to start the game
        setIsGameActive(false);
        setShowResultModal(true);
        setGameEndReason("not_enough_words_available");
      }
    } else if (!isLoading && data && data.length < NUMBER_OF_QUESTIONS_FOR_MATCHING_GAME && gameQuestions.length === 0) {
      // Data loaded, but not enough questions to start
      setIsGameActive(false);
      setShowResultModal(true);
      setGameEndReason("not_enough_words_available");
    }
  }, [data, setGameQuestions, setTimeLeft, setIsGameActive, setShowResultModal, setGameEndReason, setScore, setWrongAnswers, gameQuestions.length, isLoading]);


  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
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
      // Game already ended by time, and modal not shown, show it.
      setGameEndReason("timeout");
      setShowResultModal(true);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGameActive, timeLeft, setIsGameActive, setGameEndReason, setShowResultModal, setTimeLeft, showResultModal]);


  const setDropZoneRef = useCallback((questionId: number, node: HTMLDivElement | null) => {
    if (node) {
      dropZoneRefs.current.set(questionId, node);
    } else {
      dropZoneRefs.current.delete(questionId);
    }
  }, []);

  // Helper to calculate correct matches from a given map
  const getCorrectMatchesCount = useCallback((currentMap: Map<number, string>) => {
    let count = 0;
    gameQuestions.forEach(q => {
      if (isMatchUpQuestion(q)) {
        if (currentMap.get(q.id)?.toLocaleLowerCase() === q.word.toLocaleLowerCase()) {
          count++;
        }
      }
    });
    return count;
  }, [gameQuestions]);


  const handleMatchAttempt = useCallback((targetQuestionId: number, attemptedWord: string) => {
    setFeedbackMessage(null);
    setFeedbackType(null);

    const targetQuestion = questionsMap.current.get(targetQuestionId);

    if (targetQuestion && isMatchUpQuestion(targetQuestion)) {
      if (attemptedWord.toLocaleLowerCase() === targetQuestion.word.toLocaleLowerCase()) {
        let currentCorrectMatches = 0; // Initialize here

        setUserMatches((prev) => {
          const updatedUserMatchesMap = new Map(prev); // Always create a new map

          // Remove the word from any previous assignments
          for (const [qId, matchedWord] of updatedUserMatchesMap.entries()) {
            if (matchedWord === attemptedWord && qId !== targetQuestionId) {
              updatedUserMatchesMap.delete(qId);
              break;
            }
          }

          // Check if this is a new correct assignment for scoring
          const isNewCorrectAssignment = !prev.has(targetQuestionId) || prev.get(targetQuestionId)?.toLocaleLowerCase() !== attemptedWord.toLocaleLowerCase();
          if (isNewCorrectAssignment) {
              setScore(score + 10);
          }

          updatedUserMatchesMap.set(targetQuestionId, attemptedWord);

          // Calculate currentCorrectMatches using the map that will be the new state
          currentCorrectMatches = getCorrectMatchesCount(updatedUserMatchesMap);

          return updatedUserMatchesMap; // Return the new map for state update
        });

        correctSoundRef.current?.play().catch((err) => console.error("Correct sound error:", err));
        setFeedbackMessage("Correct Match!");
        setFeedbackType('success');

        // Now, after setUserMatches has executed its updater function and assigned `currentCorrectMatches`
        // we can check the value. This will be in the same synchronous flow.
        if (currentCorrectMatches === NUMBER_OF_QUESTIONS_FOR_MATCHING_GAME) {
            setIsGameActive(false);
            setGameEndReason("completed");
            setShowResultModal(true);
            setFeedbackMessage("All words matched! Game completed!");
            setFeedbackType('success');
        }

        return true; // Match was successful
      } else {
        setWrongAnswers(wrongAnswers + 1);
        incorrectSoundRef.current?.play().catch((err) => console.error("Incorrect sound error:", err));
        setFeedbackMessage("Incorrect. Try again!");
        setFeedbackType('error');
        return false; // Match was incorrect
      }
    }
    return false; // Target question not found or not spelling bee type
  }, [score, wrongAnswers, setScore, setWrongAnswers, getCorrectMatchesCount, setIsGameActive, setGameEndReason, setShowResultModal]);


  const handleWordDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, draggedWord: string) => {
      setIsDragging(false);
      setSelectedWord(null); // Clear selected word after drag


      for (const [questionId, dropZoneElement] of dropZoneRefs.current.entries()) {
        if (!dropZoneElement) continue;

        const dropZoneRect = dropZoneElement.getBoundingClientRect();
        const clientX = info.point.x;
        const clientY = info.point.y;

        if (
          clientX >= dropZoneRect.left &&
          clientX <= dropZoneRect.right &&
          clientY >= dropZoneRect.top &&
          clientY <= dropZoneRect.bottom
        ) {
          handleMatchAttempt(questionId, draggedWord);
          break;
        }
      }
    },
    [handleMatchAttempt]
  );

  const handleWordOptionClick = useCallback((word: string) => {
    if (!isDragging) {
      if (selectedWord === word) {
        setSelectedWord(null);
      } else {
        setSelectedWord(word);
        setFeedbackMessage("Word selected: " + word.toUpperCase());
        setFeedbackType(null);
      }
    }
  }, [selectedWord, isDragging]);


  const handleDropZoneClick = useCallback((questionId: number) => {
    if (selectedWord && !userMatches.has(questionId)) {
      handleMatchAttempt(questionId, selectedWord);
      setSelectedWord(null);
    } else if (userMatches.has(questionId)) {
        if (selectedWord === userMatches.get(questionId)) {
            let currentCorrectMatches = 0; // Initialize here

            setUserMatches(prev => {
                const updatedUserMatchesMap = new Map(prev);
                updatedUserMatchesMap.delete(questionId);

                // Calculate currentCorrectMatches using the map that will be the new state
                currentCorrectMatches = getCorrectMatchesCount(updatedUserMatchesMap);

                return updatedUserMatchesMap;
            });
            setFeedbackMessage("Word un-assigned.");
            setFeedbackType(null);

            // Check game completion after un-assigning
            if (currentCorrectMatches === NUMBER_OF_QUESTIONS_FOR_MATCHING_GAME) {
                setIsGameActive(false);
                setGameEndReason("completed");
                setShowResultModal(true);
                setFeedbackMessage("All words matched! Game completed!");
                setFeedbackType('success');
            }

        } else if (selectedWord === null) {
            setFeedbackMessage("This spot is taken. Select a word to move it, or select this word to un-assign.");
            setFeedbackType('error');
        } else {
            setFeedbackMessage("This spot is taken. Un-assign the current word first, or try another spot.");
            setFeedbackType('error');
        }
        setSelectedWord(null);
    } else {
        setFeedbackMessage("Select a word first!");
        setFeedbackType('error');
    }
  }, [selectedWord, handleMatchAttempt, userMatches, getCorrectMatchesCount, setIsGameActive, setGameEndReason, setShowResultModal]);


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  const calculateCorrectMatchesCount = useMemo(() => {
      return getCorrectMatchesCount(userMatches);
  }, [userMatches, getCorrectMatchesCount]);
  useEffect(() => {
    // This effect will run whenever calculateCorrectMatchesCount changes
    // which in turn depends on userMatches and gameQuestions
    if (calculateCorrectMatchesCount === NUMBER_OF_QUESTIONS_FOR_MATCHING_GAME && isGameActive) {
      setIsGameActive(false);
      setGameEndReason("completed");
      setShowResultModal(true);
      setFeedbackMessage("All words matched! Game completed!");
      setFeedbackType('success');
    }
  }, [calculateCorrectMatchesCount, isGameActive, setIsGameActive, setGameEndReason, setShowResultModal, setFeedbackMessage, setFeedbackType]);

  if (isLoading) {
    return <Loading />;
  }

  if (gameQuestions.length === 0 && !isLoading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen text-2xl text-white">
              <p>Not enough relevant game questions available for a matching round. Please try a different selection or wait for more content.</p>
              {data && data.length > 0 && (
                  <p className="text-lg mt-2">Fetched {data.length} questions, but not enough of type  `Match up`.</p>
              )}
          </div>
      );
  }

  return (
    <div
      className="flex flex-col items-center w-full min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/animation/anagram-bg.jpg')",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <Header
        currentWordIndex={calculateCorrectMatchesCount}
        totalWords={NUMBER_OF_QUESTIONS_FOR_MATCHING_GAME}
      />
      <div className="mx-auto flex max-w-7xl flex-col gap-4 p-4 sm:p-6 lg:p-8 w-full">
        {/* Header (Score, Time) */}
        <div className="flex flex-col items-center justify-between gap-2 sm:mb-2 sm:flex-row sm:gap-4">
          <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:gap-4">
            <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-blue-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
              Score: {score}
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-green-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
              Matched: {calculateCorrectMatchesCount} / {NUMBER_OF_QUESTIONS_FOR_MATCHING_GAME}
            </div>
            <div className="rounded-xl bg-white/80 px-3 py-2 text-lg font-bold text-red-600 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-4 sm:text-xl">
              Wrong Attempts: {wrongAnswers}
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
                  feedbackType === 'success' ? "text-green-600" : feedbackType === 'error' ? "text-red-600" : "text-blue-600" // Blue for info
              } bg-white/50 p-2 rounded-lg shadow-md`}
              aria-live="polite"
            >
              {feedbackMessage}
            </motion.div>
        )}

        {/* Main Game Area: Pictures with Drop Zones */}
        <div className="flex flex-wrap justify-center gap-4 py-4 w-full max-h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {gameQuestions.map((question) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className={`relative flex flex-col items-center p-3 sm:p-4 rounded-3xl shadow-lg transition-all duration-300 transform
                  ${isDragging ? 'scale-105 shadow-xl' : ''}
                  ${userMatches.has(question.id) && userMatches.get(question.id) === (isMatchUpQuestion(question) ? question.word : null)
                      ? 'bg-green-100/70 border-green-400' // Correctly matched
                      : userMatches.has(question.id)
                        ? 'bg-red-100/70 border-red-400' // Assigned (potentially incorrect if it gets here)
                        : 'bg-white/80 border-blue-200' // Default
                  }
                  border-2 w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(25%-1rem)] xl:w-[calc(20%-1rem)] max-w-[200px] aspect-square
                `}
              >
                {/* Image */}
                <div className="mb-2 w-full flex justify-center">
                  {question.imageSrc ? (
                    <Image
                      src={
                        typeof question.imageSrc === "string"
                          ? question.imageSrc
                          : URL.createObjectURL(question.imageSrc)
                      }
                      alt={isMatchUpQuestion(question) ? question.word : "Question Image"}
                      width={100}
                      height={100}
                      className="object-contain h-24 w-24 sm:h-28 sm:w-28 rounded-lg shadow-sm"
                    />
                  ) : (
                    <LucideImageOff className="h-20 w-20 sm:h-24 sm:w-24 text-gray-400" />
                  )}
                </div>
                {/* Drop Zone */}
                <div
                  ref={(node) => setDropZoneRef(question.id, node)}
                  onClick={() => handleDropZoneClick(question.id)}
                  className={`mt-auto flex items-center justify-center min-h-[40px] sm:min-h-[50px] w-full rounded-md border-2 border-dashed
                  ${userMatches.has(question.id)
                      ? 'border-green-400 bg-green-100/20' // Assigned, show green border (if userMatches.get(q.id) is correct word, it's green)
                      : selectedWord && !isDragging
                          ? 'border-purple-500 bg-purple-100/30 cursor-pointer' // Highlight if word selected
                          : 'border-gray-300 bg-gray-100/20 cursor-pointer' // Default empty zone
                  }
                  p-1 text-center text-sm sm:text-base font-semibold text-gray-700 transition-colors duration-150`}
                >
                  {userMatches.get(question.id) ? (
                    <motion.div
                      key={userMatches.get(question.id)}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="text-blue-700 font-bold bg-blue-100 rounded-md px-2 py-1 truncate max-w-full"
                    >
                      {userMatches.get(question.id)?.toUpperCase()}
                    </motion.div>
                  ) : (
                    <span className="text-gray-500/70">
                        {selectedWord ? "Click to assign " + selectedWord.toUpperCase() : "Drop or click here"}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Draggable Word Options */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4 py-4 bg-white/20 rounded-xl backdrop-blur-sm shadow-xl border border-white/30">
          <AnimatePresence>
            {wordOptions.map((word) => (
              // Only render if the word is not already matched to any picture
              !Array.from(userMatches.values()).includes(word) && (
                <motion.div
                  key={word}
                  drag
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={(e, info) => handleWordDragEnd(e, info, word)}
                  dragSnapToOrigin
                  onClick={() => handleWordOptionClick(word)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, cursor: "grabbing" }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`flex items-center justify-center h-14 sm:h-16 px-4 sm:px-6 rounded-full border-2
                  ${selectedWord === word ? 'border-amber-500 bg-amber-600 ring-4 ring-amber-300' : 'border-purple-400 bg-purple-600'}
                  text-white text-base sm:text-lg font-bold shadow-md cursor-pointer flex-shrink-0
                  ${isDragging ? 'z-50' : ''}
                  `}
                >
                  {word.toUpperCase()}
                </motion.div>
              )
            ))}
          </AnimatePresence>
        </div>

        {/* ResultModal component - UNCOMMENTED */}
        <ResultModal />
      </div>
    </div>
  );
};