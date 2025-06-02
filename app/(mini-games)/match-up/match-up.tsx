// app/(mini-games)/match-up/game.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Lightbulb } from "lucide-react";
import Image from "next/image";

import GameEndScreen from "./game-end-screen";
import { MatchUpGameData } from "./page";

import { DifficultyEnum, GameTypeEnum } from "@/app/models/Game";
import { Footer } from "@/components/ui/footer-game";
import { Header } from "@/components/ui/header-game";
import { shuffleArray } from "@/lib/utils";



interface GameProps {
  topicId: number;
  difficulty: DifficultyEnum;
  gameType: GameTypeEnum;
  questions: MatchUpGameData[];
}

interface SelectableChoice {
  word: string;
  id: string; // Unique ID for this selectable instance (important for keys and filtering)
}

interface SelectableWordProps {
  word: string;
  id: string;
  isUsed: boolean; // Controls opacity and pointer events
  isDisabled: boolean; // Controls clickability and hover effects
  onTapToSelect: (word: string, id: string) => void;
  isSelected: boolean;
}

const SelectableWord: React.FC<SelectableWordProps> = ({ word, id, isUsed, isDisabled, onTapToSelect, isSelected }) => {
  return (
    <motion.div
      className={`
        bg-blue-500 text-white font-bold text-lg sm:text-xl md:text-2xl
        px-4 py-2 rounded-lg shadow-md flex-shrink-0
        transition-opacity duration-300 select-none
        ${isUsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${isSelected ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-blue-500' : ''}
        relative z-30
      `}
      whileHover={!isDisabled && !isSelected ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      onClick={() => {
        if (!isDisabled) {
          onTapToSelect(word, id);
        }
      }}
      key={id}
    >
      {word}
    </motion.div>
  );
};


export const Game = ({ questions: initialQuestionsData }: GameProps) => {
  // --- ALL REACT HOOKS MUST BE DECLARED AT THE VERY TOP LEVEL, UNCONDITIONALLY ---
  const allGameQuestions = useRef<MatchUpGameData[]>([]);

  const [currentRoundQuestions, setCurrentRoundQuestions] = useState<MatchUpGameData[]>([]);
  const [placedWordsMap, setPlacedWordsMap] = useState<Map<string, string>>(new Map());
  const [matchedImageIds, setMatchedImageIds] = useState<Set<string>>(new Set());
  const [availableChoices, setAvailableChoices] = useState<SelectableChoice[]>([]);
  const [selectedWordForPlacement, setSelectedWordForPlacement] = useState<SelectableChoice | null>(null);
  const [totalRoundsCompleted, setTotalRoundsCompleted] = useState(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [scoreTracker, setScoreTracker] = useState<Set<string>>(new Set());

  // --- End of Hook Declarations ---

  // Now, safely handle the case where initialQuestionsData is empty *after* hooks are called.
  useEffect(() => {
    // Only shuffle and set if initialQuestionsData is valid and allGameQuestions.current is not yet populated
    if (Array.isArray(initialQuestionsData) && initialQuestionsData.length > 0 && allGameQuestions.current.length === 0) {
        allGameQuestions.current = shuffleArray([...initialQuestionsData]);
        // A dummy update to trigger a re-render if needed to ensure `initializeRound` runs with data
        // setTotalRoundsCompleted(0); // This isn't strictly necessary if initializeRound is called in its own effect
    }
  }, [initialQuestionsData]);


  const QUESTIONS_PER_ROUND = 8;
  const MAX_INCORRECT_ATTEMPTS = 10;

  const initializeRound = useCallback(() => {
    // Now, this check is part of the logic, not preventing hooks from being called.
    if (!Array.isArray(allGameQuestions.current) || allGameQuestions.current.length === 0) {
        // This scenario should ideally be prevented by the parent component not rendering Game
        // if data is truly unavailable, but this is a fail-safe.
        console.warn("No questions available in allGameQuestions.current to initialize round.");
        setIsRunning(false);
        setIsGameOver(true);
        setHasWon(false);
        return;
    }

    const totalUniqueQuestionsInGame = allGameQuestions.current.length;

    if (scoreTracker.size >= totalUniqueQuestionsInGame) {
        setIsRunning(false);
        setIsGameOver(true);
        setHasWon(true);
        return;
    }

    const startIndex = (totalRoundsCompleted * QUESTIONS_PER_ROUND) % totalUniqueQuestionsInGame;
    const newRoundQuestions: MatchUpGameData[] = [];

    for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
        const questionIndex = (startIndex + i) % totalUniqueQuestionsInGame;
        newRoundQuestions.push(allGameQuestions.current[questionIndex]);
    }

    setCurrentRoundQuestions(newRoundQuestions);
    setPlacedWordsMap(new Map());
    setMatchedImageIds(new Set());
    setSelectedWordForPlacement(null);

    const restoredMatchedIdsForCurrentRound = new Set<string>();
    const restoredPlacedWordsForCurrentRound = new Map<string, string>();

    newRoundQuestions.forEach(q => {
        if (scoreTracker.has(q.id)) {
            restoredMatchedIdsForCurrentRound.add(q.id);
            restoredPlacedWordsForCurrentRound.set(q.id, q.correctWord);
        }
    });
    setMatchedImageIds(restoredMatchedIdsForCurrentRound);
    setPlacedWordsMap(restoredPlacedWordsForCurrentRound);

    const wordsForAvailableChoices = new Set<string>();
    newRoundQuestions.forEach(q => {
      if (!scoreTracker.has(q.id)) {
        q.choices.forEach(choice => wordsForAvailableChoices.add(choice));
      }
    });

    const filteredWords = Array.from(wordsForAvailableChoices).filter(word => {
        return !allGameQuestions.current.some(q => q.correctWord === word && scoreTracker.has(q.id));
    });

    const shuffledAndIdChoices: SelectableChoice[] = shuffleArray(filteredWords).map(word => ({
      word,
      id: `${word}-${crypto.randomUUID()}`
    }));

    setAvailableChoices(shuffledAndIdChoices);
    setFeedbackMessage(null);

    // Only start timer/running if not already running (i.e., on first load)
    if (totalRoundsCompleted === 0 && !isRunning) {
      setTime(0);
      setIsRunning(true);
    }

  }, [totalRoundsCompleted, allGameQuestions, scoreTracker, isRunning]);


  useEffect(() => {
    setScore(scoreTracker.size);
    if (scoreTracker.size > 0 && scoreTracker.size === allGameQuestions.current.length && allGameQuestions.current.length > 0) { // Added length check
        setFeedbackMessage("Congratulations! You've matched all items!");
        setIsRunning(false);
        setIsGameOver(true);
        setHasWon(true);
    }
  }, [scoreTracker, allGameQuestions.current.length]);


  const handleUnplaceWord = useCallback((imageId: string) => {
    setPlacedWordsMap(prevMap => {
      const newMap = new Map(prevMap);
      if (newMap.has(imageId) && !scoreTracker.has(imageId)) {
        newMap.delete(imageId);
        setSelectedWordForPlacement(null);
      }
      return newMap;
    });
  }, [scoreTracker]);


  const handleTapToSelectWord = useCallback((word: string, id: string) => {
    if (selectedWordForPlacement && selectedWordForPlacement.id === id) {
      setSelectedWordForPlacement(null);
    } else {
      let imageIdHoldingThisWord: string | null = null;
      for (const [imgId, placedWord] of placedWordsMap.entries()) {
        if (placedWord === word) {
          imageIdHoldingThisWord = imgId;
          break;
        }
      }

      if (imageIdHoldingThisWord) {
        if (!scoreTracker.has(imageIdHoldingThisWord)) {
            handleUnplaceWord(imageIdHoldingThisWord);
        }
      }
      setSelectedWordForPlacement({ word, id });
    }
  }, [selectedWordForPlacement, placedWordsMap, handleUnplaceWord, scoreTracker]);


  const handleTapOnPlacementZone = useCallback((imageId: string) => {
    if (scoreTracker.has(imageId)) {
      return;
    }

    if (selectedWordForPlacement) {
      const question = currentRoundQuestions.find(q => q.id === imageId);

      if (!question) {
        console.error("Question not found for imageId:", imageId);
        setSelectedWordForPlacement(null);
        return;
      }

      if (selectedWordForPlacement.word === question.correctWord) {
        const selectedChoiceId = selectedWordForPlacement.id;

        setScoreTracker(prevTracker => {
            const newTracker = new Set(prevTracker);
            newTracker.add(imageId);
            return newTracker;
        });

        setMatchedImageIds(prevIds => {
          const newIds = new Set(prevIds);
          newIds.add(imageId);
          return newIds;
        });

        setPlacedWordsMap(prevMap => {
          const newMap = new Map(prevMap);
          for (const [key, value] of newMap.entries()) {
            if (value === selectedWordForPlacement.word && key !== imageId) {
                if (!scoreTracker.has(key)) {
                    newMap.delete(key);
                }
            }
          }
          newMap.set(imageId, selectedWordForPlacement.word);
          return newMap;
        });

        setAvailableChoices(prevChoices => prevChoices.filter(
          choice => choice.id !== selectedChoiceId
        ));

        setFeedbackMessage("Correct!");
        setSelectedWordForPlacement(null);

      } else {
        setFeedbackMessage("Incorrect, try again!");
        setIncorrectAttempts(prev => {
          const newAttempt = prev + 1;
          if (newAttempt >= MAX_INCORRECT_ATTEMPTS) {
            setIsGameOver(true);
            setIsRunning(false);
            setHasWon(false);
          }
          return newAttempt;
        });
        setSelectedWordForPlacement(null);

        setPlacedWordsMap(prevMap => {
            const newMap = new Map(prevMap);
            for (const [key, value] of newMap.entries()) {
                if (value === selectedWordForPlacement.word && !scoreTracker.has(key)) {
                    newMap.delete(key);
                }
            }
            newMap.set(imageId, selectedWordForPlacement.word);
            return newMap;
        });

        setTimeout(() => {
            setPlacedWordsMap(prevMap => {
                const mapAfterDelay = new Map(prevMap);
                if (mapAfterDelay.get(imageId) === selectedWordForPlacement?.word && !scoreTracker.has(imageId)) {
                    mapAfterDelay.delete(imageId);
                }
                return mapAfterDelay;
            });
            setFeedbackMessage(null);
        }, 800);
      }
    } else if (placedWordsMap.has(imageId) && !scoreTracker.has(imageId)) {
      handleUnplaceWord(imageId);
    }
  }, [selectedWordForPlacement, currentRoundQuestions, placedWordsMap, scoreTracker, MAX_INCORRECT_ATTEMPTS, handleUnplaceWord]);


  const restartGame = useCallback(() => {
    setIsGameOver(false);
    setScore(0);
    setScoreTracker(new Set());
    setTotalRoundsCompleted(0);
    setIncorrectAttempts(0);
    setHasWon(false);
    setTime(0);
    setIsRunning(true);
    setFeedbackMessage(null);
    setSelectedWordForPlacement(null);
    allGameQuestions.current = shuffleArray([...initialQuestionsData]);
  }, [initialQuestionsData]);


  useEffect(() => {
    // Only initialize round if not already game over or won, AND allGameQuestions.current has been populated
    if (!isGameOver && !hasWon && allGameQuestions.current.length > 0) {
      initializeRound();
    }
  }, [totalRoundsCompleted, isGameOver, hasWon, initializeRound, allGameQuestions.current.length]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  useEffect(() => {
    if (matchedImageIds.size > 0 && matchedImageIds.size === QUESTIONS_PER_ROUND) {
        if (scoreTracker.size < allGameQuestions.current.length) {
            setFeedbackMessage("Round complete! Loading next images.");
            setIsRunning(false);
            setTimeout(() => {
                setTotalRoundsCompleted(prev => prev + 1);
                setIsRunning(true);
            }, 1500);
        }
    }
  }, [matchedImageIds, QUESTIONS_PER_ROUND, scoreTracker, allGameQuestions.current.length]);

  // --- Conditional Render for initialQuestionsData check (now safe after hooks) ---
  if (!Array.isArray(initialQuestionsData) || initialQuestionsData.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center text-2xl text-white">
        No questions available for this difficulty/topic!
      </div>
    );
  }

  // If initialQuestionsData exists but allGameQuestions.current hasn't been set up yet,
  // we might want a loading state or similar, or just let the `useEffect` populate it.
  // For now, if allGameQuestions.current is empty, it means the first `useEffect` hasn't run yet.
  if (allGameQuestions.current.length === 0) {
    return (
        <div className="flex min-h-screen items-center justify-center text-2xl text-white">
            Loading game questions...
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
      <div className="absolute inset-0 bg-black opacity-5 z-0"></div>

      <Header
        currentWordIndex={score}
        totalWords={allGameQuestions.current.length}
      />

      <div className="relative z-10 flex flex-col items-center w-full flex-grow overflow-x-hidden">
        {isGameOver ? (
          <GameEndScreen
            score={score}
            time={time}
            onRestart={restartGame}
            hasWon={hasWon}
          />
        ) : (
          <>
            <div
              className="flex flex-col items-center flex-grow mx-auto w-fit
                         min-w-[380px] md:min-w-[700px] lg:min-w-[900px] max-w-full
                         px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8
                         md:flex-row justify-center gap-4 md:gap-6 lg:gap-8
                         mt-8 mb-8 p-4 md:p-6 rounded-xl shadow-2xl relative "
              style={{
                backgroundImage: "url('/animation/anagram-bg2.jpg')",
                backgroundPosition: "center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "local",
              }}
            >
              <div className="absolute inset-0 bg-white opacity-10 rounded-xl z-10"></div>

              <div className="relative z-20 flex flex-col items-center gap-3 order-first md:order-last flex-shrink">
                  <div
                      className="relative w-full max-w-[250px] sm:max-w-[300px] lg:max-w-[350px] aspect-video mb-3 rounded-lg overflow-hidden"
                      style={{
                          backgroundImage: "url('/animation/timer-background.png')",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat"
                      }}
                  >
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono text-white text-game-display">
                              {Math.floor(time / 60)}:{time % 60 < 10 ? `0${time % 60}` : time % 60}
                          </div>
                      </div>
                  </div>

                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono text-yellow-400 text-game-display mb-1">
                      Score
                  </div>

                  <div
                      className="relative w-full max-w-[250px] sm:max-w-[300px] lg:max-w-[350px] aspect-video mb-3 rounded-lg overflow-hidden"
                      style={{
                          backgroundImage: "url('/animation/score-board.png')",
                          backgroundSize: "contain",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat"
                      }}
                  >
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono text-white text-game-display">
                            {score}
                          </div>
                      </div>
                  </div>

                  {(() => {
                      const attemptsLeft = MAX_INCORRECT_ATTEMPTS - incorrectAttempts;
                      let containerClasses = "flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 rounded-xl font-bold transition-colors duration-300 transform scale-100";
                      const textClasses = "text-sm sm:text-base md:text-lg";
                      let icon = null;
                      const iconClasses = "mr-1 h-4 w-4 sm:h-5 sm:w-5";

                      if (attemptsLeft <= 0) {
                          containerClasses += " bg-gray-200 border-gray-400 text-gray-600 border-2";
                          icon = <Lightbulb className={`${iconClasses} text-gray-500`} />;
                      } else if (attemptsLeft <= 2) {
                          containerClasses += " bg-red-100 border-red-400 text-red-700 border-2";
                          icon = <AlertTriangle className={`${iconClasses} text-red-600`} />;
                          if (attemptsLeft === 1) {
                              containerClasses += " animate-pulse-fast";
                          }
                      } else {
                          containerClasses += " bg-green-50 border-green-200 text-green-600 border-2";
                          icon = <Lightbulb className={`${iconClasses} text-green-500`} />;
                      }

                      return (
                          <motion.div
                              key={attemptsLeft}
                              initial={{ opacity: 0, y: -20, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              className={`${containerClasses} ${textClasses}`}
                          >
                              {icon}
                              <span>You have {attemptsLeft} attempts left</span>
                          </motion.div>
                      );
                  })()}
              </div>

              <div className="relative z-20 flex flex-col items-center flex-grow gap-4 lg:gap-6
                              bg-white/20 p-4 rounded-lg shadow-xl border border-yellow-400
                              w-full max-w-5xl md:max-w-4xl">

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr w-full">
                  {currentRoundQuestions.map((q) => {
                    const isImageMatched = scoreTracker.has(q.id);
                    const currentPlacedWord = placedWordsMap.get(q.id) || null;
                    const isPlacementZoneActive = selectedWordForPlacement !== null && !isImageMatched;

                    return (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex flex-col items-center justify-between p-2 rounded-lg bg-white/70 shadow-md
                                    ${isImageMatched ? 'border-4 border-green-500' : 'border border-gray-300'}
                                    ${isImageMatched ? 'pointer-events-none' : ''}`}
                      >
                        <div className="mb-2 p-1 border border-gray-200 rounded-md bg-white flex-shrink-0 w-full">
                          <Image
                            src={q.imageSrc}
                            alt={q.correctWord}
                            width={150}
                            height={112}
                            className="object-contain w-full h-auto max-h-[100px] md:max-h-[120px]"
                          />
                        </div>

                        <motion.div
                          id={`placement-zone-${q.id}`}
                          className={`
                            w-full h-12 flex items-center justify-center
                            border-2 rounded-lg mb-2
                            ${isImageMatched ? 'border-green-500 bg-green-100 text-green-700' :
                             isPlacementZoneActive ? 'border-yellow-400 bg-yellow-50 text-yellow-800 ring-2 ring-yellow-300' :
                             currentPlacedWord ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-400 bg-gray-50'}
                            text-gray-800 text-sm sm:text-base md:text-lg font-bold uppercase
                            transition-colors duration-300 select-none
                            ${isImageMatched ? 'cursor-not-allowed' : 'cursor-pointer'}
                          `}
                          onClick={() => {
                              handleTapOnPlacementZone(q.id);
                          }}
                          whileHover={isPlacementZoneActive ? { scale: 1.02, backgroundColor: 'rgba(255, 247, 237, 0.7)' } : {}}
                        >
                          {isImageMatched ? q.correctWord : (currentPlacedWord || (isPlacementZoneActive ? "TAP TO PLACE" : "Tap here"))}
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      className="w-full flex justify-center gap-2 sm:gap-3 p-3 rounded-md min-w-0 flex-wrap "
                    >
                      {availableChoices.map((selectableChoice) => {
                        const isSelected = selectedWordForPlacement?.id === selectableChoice.id;

                        const isWordAssociatedWithGloballyMatched = allGameQuestions.current.some(
                          q => q.correctWord === selectableChoice.word && scoreTracker.has(q.id)
                        );

                        return (
                          <SelectableWord
                            key={selectableChoice.id}
                            word={selectableChoice.word}
                            id={selectableChoice.id}
                            isUsed={isWordAssociatedWithGloballyMatched}
                            isDisabled={isWordAssociatedWithGloballyMatched}
                            onTapToSelect={handleTapToSelectWord}
                            isSelected={isSelected}
                          />
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
              </div>

            </div>

            {feedbackMessage && (
                <motion.div
                    key={feedbackMessage}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`mt-3 text-lg sm:text-xl font-bold ${
                        feedbackMessage.includes("Correct!") || feedbackMessage.includes("Congratulations!") ? "text-green-500" : "text-yellow-500"
                    }`}
                    aria-live="polite"
                >
                    {feedbackMessage}
                </motion.div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};