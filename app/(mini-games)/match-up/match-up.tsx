// app/(mini-games)/match-up/match-up.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion"; // Using require for commonJS interop
import { AlertTriangle, Lightbulb } from "lucide-react";

import { useSpellingBeeStore } from "@/store/use-game-spellingbee";
import { ResultModal } from "./results"; // Import your ResultModal
import { useGetRandomGameQuestionByGameType } from "@/hooks/use-game-question-hook";
import { GameTypeEnum, SpellingBeeGameQuestion } from "@/app/models/Game";
import Loading from "@/components/loading";
import { shuffleArray } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Define a type for your draggable choices
interface DraggableChoice {
  word: string;
  id: string; // Unique ID for this draggable instance
}

// Draggable Word component (enhanced with selected state)
interface DraggableWordProps {
  word: string;
  id: string; // Unique ID for the draggable element itself
  onDragEnd: (info: any, wordId: string, word: string) => void;
  onClick: (wordId: string, word: string) => void; // New onClick handler for selection
  isDropped: boolean; // To hide the word if it's correctly dropped
  isDisabled: boolean; // To disable dragging for already matched words
  isSelected: boolean; // NEW: To visually indicate selection
}

const DraggableWord: React.FC<DraggableWordProps> = ({ word, id, onDragEnd, onClick, isDropped, isDisabled, isSelected }) => {
  return (
    <motion.div
      className={`
        bg-blue-500 text-white font-bold text-lg sm:text-xl md:text-2xl
        px-4 py-2 rounded-lg shadow-md flex-shrink-0
        transition-all duration-200 select-none
        ${isDropped ? 'opacity-0 pointer-events-none' : 'opacity-100'} /* Hidden if correctly dropped */
        ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab'}
        ${isSelected ? 'border-4 border-yellow-400 shadow-lg scale-105' : ''} /* Visual feedback for selection */
        relative z-30
      `}
      drag={!isDisabled}
      dragSnapToOrigin
      onDragEnd={(event, info) => onDragEnd(info, id, word)}
      onClick={() => !isDisabled && onClick(id, word)} // Call onClick for selection
      whileHover={!isDisabled && !isSelected ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95, cursor: 'grabbing' } : {}}
      key={id}
    >
      {word}
    </motion.div>
  );
};

// --- Main GameScreen Component ---
export const GameScreen: React.FC = () => {
  // --- Global Store Access (for settings) ---
  const {
    selectedDifficulty,
    selectedTopic,
    setShowResultModal,
    showResultModal // Get showResultModal state from the store
  } = useSpellingBeeStore();

  // --- Game-specific State Declarations ---
  const [currentRoundQuestions, setCurrentRoundQuestions] = useState<SpellingBeeGameQuestion[]>([]);
  const [droppedWordsMap, setDroppedWordsMap] = useState<Map<string, string>>(new Map()); // Map: imageId (string) -> droppedWord
  const [matchedImageIds, setMatchedImageIds] = useState<Set<string>>(new Set()); // Set of image IDs (string) that are correctly matched
  const [availableChoices, setAvailableChoices] = useState<DraggableChoice[]>([]); // Words to drag (all words in the round), now with unique IDs
  const [selectedWord, setSelectedWord] = useState<DraggableChoice | null>(null); // Tracks the word clicked for placement
  const [totalRoundsCompleted, setTotalRoundsCompleted] = useState(0); // This will now represent games completed if we end after one round
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // --- Ref Hooks ---
  const dropTargetRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);

  // --- Constants ---
  const QUESTIONS_PER_ROUND = 8;
  const MAX_INCORRECT_ATTEMPTS = 10;

  // --- Data Fetching Hook ---
  const gameType = GameTypeEnum.MATCH_UP;
  const { data: initialQuestionsData, isLoading } = useGetRandomGameQuestionByGameType(
    gameType,
    selectedDifficulty,
    selectedTopic?.id ?? 0,
    QUESTIONS_PER_ROUND // Fetch exactly one round's worth of questions
  );
  interface QuestionWithChoices extends SpellingBeeGameQuestion {
    choices: string[];
  }


  // Type guard function
  function hasChoicesStrict(question: SpellingBeeGameQuestion): question is QuestionWithChoices {
      // Check if the property exists and if it's an array of strings
      if (!('choices' in question) || !Array.isArray(question.choices) || !question.choices.every(choice => typeof choice === 'string')) {
          return false;
      }
      return true;
  }
  // --- Utility to get drop zone rects (Memoized) ---
  const getDropZoneRects = useCallback(() => {
    const rects: Map<string, DOMRect> = new Map();
    currentRoundQuestions.forEach(q => {
      const idString = q.id.toString();
      const element = dropTargetRefs.current[idString];
      if (element) {
        rects.set(idString, element.getBoundingClientRect());
      }
    });
    return rects;
  }, [currentRoundQuestions]);


  // --- Game Logic Callbacks (Memoized) ---

  const initializeRound = useCallback(() => {
    if (!initialQuestionsData || initialQuestionsData.length === 0) {
      console.warn("No initial questions data available to start a round.");
      setIsRunning(false);
      setIsGameOver(true);
      setHasWon(false);
      setShowResultModal(true); // Show modal even if no questions
      return;
    }

    // Ensure we only use QUESTIONS_PER_ROUND for the single round
    let newRoundQuestions: SpellingBeeGameQuestion[] = initialQuestionsData.slice(0, QUESTIONS_PER_ROUND);

    newRoundQuestions = shuffleArray(newRoundQuestions);

    setCurrentRoundQuestions(newRoundQuestions);
    setDroppedWordsMap(new Map());
    setMatchedImageIds(new Set());
    setSelectedWord(null); // Clear selected word on new round

    const allPossibleChoicesInRound = new Set<string>();
    newRoundQuestions.forEach(q => {
      allPossibleChoicesInRound.add(q.word);
      if (hasChoicesStrict(q)) { // Use the type guard
          q.choices.forEach((choice: string) => allPossibleChoicesInRound.add(choice));
      }
    });

    const shuffledAndIdChoices: DraggableChoice[] = shuffleArray(Array.from(allPossibleChoicesInRound)).map(word => ({
      word,
      id: `${word}-${crypto.randomUUID()}`
    }));

    setAvailableChoices(shuffledAndIdChoices);
    setFeedbackMessage(null);

    // Start timer only if it's the beginning of a new game (totalRoundsCompleted is 0)
    if (totalRoundsCompleted === 0 && !isGameOver) {
      setTime(0);
      setIsRunning(true);
    }

  }, [initialQuestionsData, totalRoundsCompleted, isGameOver, setShowResultModal]);

  const handleDragEnd = useCallback((info: DraggableEvent, draggableWordId: string, word: string) => {
    // Clear any selected word when a drag interaction completes
    setSelectedWord(null);

    const dropZoneRects = getDropZoneRects();
    let droppedOnImageId: string | null = null;

    for (const [imageId, rect] of dropZoneRects.entries()) {
      const dropX = (info as { point: { x: number; y: number } }).point.x;
      const dropY = (info as { point: { x: number; y: number } }).point.y;

      if (
        dropX >= rect.left &&
        dropX <= rect.right &&
        dropY >= rect.top &&
        dropY <= rect.bottom
      ) {
        if (!matchedImageIds.has(imageId)) { // Only allow dropping on unmatched slots
          droppedOnImageId = imageId;
          break;
        }
      }
    }
    if (droppedOnImageId) {
        const targetQuestion = currentRoundQuestions.find(q => q.id.toString() === droppedOnImageId);

        if (targetQuestion && word.toLocaleLowerCase() === targetQuestion.word.toLocaleLowerCase()) {
            // Correct match
            setDroppedWordsMap(prevMap => {
                const newMap = new Map(prevMap);
                // Remove the word if it was previously in another slot (incorrectly placed)
                for (const [key, value] of newMap.entries()) {
                    if (value === word && !matchedImageIds.has(key)) {
                        newMap.delete(key);
                        break;
                    }
                }
                newMap.set(droppedOnImageId, word); // Place the word
                return newMap;
            });
            setMatchedImageIds(prevSet => {
                const newSet = new Set(prevSet);
                newSet.add(droppedOnImageId); // Mark as matched
                return newSet;
            });
            setScore(prevScore => prevScore + 10);
            correctSoundRef.current?.play().catch(console.error);
            setFeedbackMessage("Correct!");
            setTimeout(() => setFeedbackMessage(null), 700);

            // Check if all are matched to end the game (since it's only one round)
            if (matchedImageIds.size + 1 === QUESTIONS_PER_ROUND) { // +1 because state might not be updated yet
                setTimeout(() => {
                    setFeedbackMessage("All matched! Game Over!");
                    setIsRunning(false);
                    setHasWon(true); // Player won the round
                    setIsGameOver(true);
                    setShowResultModal(true);
                    setTotalRoundsCompleted(1); // Mark one game as completed
                }, 800);
            }

        } else {
            // Incorrect match
            setIncorrectAttempts(prev => {
                const newAttempt = prev + 1;
                if (newAttempt >= MAX_INCORRECT_ATTEMPTS) {
                    setIsGameOver(true);
                    setIsRunning(false);
                    setHasWon(false); // Game lost due to max attempts
                    setShowResultModal(true);
                }
                return newAttempt;
            });
            incorrectSoundRef.current?.play().catch(console.error);
            setFeedbackMessage("Incorrect! Try again.");
            setTimeout(() => setFeedbackMessage(null), 1000);
            // Word remains in pool, or if it was in another slot, it stays there.
            // If it was already in the *same* slot (but incorrect), it just stays there.
            // If it was previously in an *incorrect* slot and you tried to move it to another *incorrect* slot, it doesn't move.
            // For simplicity, if it's incorrect, we just don't allow the placement.
            // If it was already in a slot, it stays there, if not it goes back to choices pool.
        }
    }
    // If not dropped on any image, it just snaps back due to dragSnapToOrigin
  }, [getDropZoneRects, matchedImageIds, currentRoundQuestions, correctSoundRef, incorrectSoundRef, setScore, setShowResultModal, setIsRunning, setHasWon, setIsGameOver, setTotalRoundsCompleted]);


  // handleUndropWord - unchanged, still allows removing INCORRECTLY placed words
  const handleUndropWord = useCallback((imageId: string) => {
    setDroppedWordsMap(prevMap => {
      const newMap = new Map(prevMap);
      if (newMap.has(imageId) && !matchedImageIds.has(imageId)) { // Only undrop if not a correct match
        newMap.delete(imageId);
      }
      return newMap;
    });
  }, [matchedImageIds]);


  // NEW: Handle click on a draggable word (for selection)
  const handleDraggableWordClick = useCallback((wordId: string, wordValue: string) => {
    // If the word is already correctly matched, do nothing
    const isWordMatched = currentRoundQuestions.some(q => matchedImageIds.has(q.id.toString()) && q.word === wordValue);
    if (isWordMatched) {
      return;
    }

    const clickedDraggable = availableChoices.find(choice => choice.id === wordId);
    if (clickedDraggable) {
      // If the clicked word is already selected, deselect it
      if (selectedWord?.id === clickedDraggable.id) {
        setSelectedWord(null);
      } else {
        // Otherwise, select it
        setSelectedWord(clickedDraggable);
      }
    }
  }, [selectedWord, availableChoices, matchedImageIds, currentRoundQuestions]);

  // NEW: Handle click on a drop zone (to place or undrop)
  const handleDropZoneClick = useCallback((imageId: string) => {
    const qIdString = imageId; // Already a string
    const currentDroppedWord = droppedWordsMap.get(qIdString);
    const isMatched = matchedImageIds.has(qIdString);

    if (isMatched) {
      // Do nothing if the slot is already correctly matched
      return;
    }

    if (selectedWord) {
      // A word is selected, try to place it
      const targetQuestion = currentRoundQuestions.find(q => q.id.toString() === qIdString);

      if (targetQuestion && selectedWord.word.toLocaleLowerCase() === targetQuestion.word.toLocaleLowerCase()) {
        // Correct match
        setDroppedWordsMap(prevMap => {
          const newMap = new Map(prevMap);

          // Remove the selected word if it's currently in another slot (incorrectly placed)
          for (const [key, value] of newMap.entries()) {
            if (value === selectedWord.word && !matchedImageIds.has(key)) {
              newMap.delete(key);
              break;
            }
          }

          // If there's a word already in this slot (it must be incorrect), remove it
          if (newMap.has(qIdString)) {
              newMap.delete(qIdString);
          }

          newMap.set(qIdString, selectedWord.word); // Place the correct word
          return newMap;
        });
        setMatchedImageIds(prevSet => {
            const newSet = new Set(prevSet);
            newSet.add(qIdString); // Mark as matched
            return newSet;
        });
        setScore(prevScore => prevScore + 10);
        correctSoundRef.current?.play().catch(console.error);
        setFeedbackMessage("Correct!");
        setTimeout(() => setFeedbackMessage(null), 700);

        setSelectedWord(null); // Deselect the word after successful placement

        // Check if all are matched to end the game (since it's only one round)
        if (matchedImageIds.size + 1 === QUESTIONS_PER_ROUND) { // +1 because state might not be updated yet
            setTimeout(() => {
                setFeedbackMessage("All matched! Game Over!");
                setIsRunning(false);
                setHasWon(true); // Player won the round
                setIsGameOver(true);
                setShowResultModal(true);
                setTotalRoundsCompleted(1); // Mark one game as completed
            }, 800);
        }

      } else {
        // Incorrect match
        setIncorrectAttempts(prev => {
            const newAttempt = prev + 1;
            if (newAttempt >= MAX_INCORRECT_ATTEMPTS) {
                setIsGameOver(true);
                setIsRunning(false);
                setHasWon(false); // Game lost due to max attempts
                setShowResultModal(true);
            }
            return newAttempt;
        });
        incorrectSoundRef.current?.play().catch(console.error);
        setFeedbackMessage("Incorrect! Try again.");
        setTimeout(() => setFeedbackMessage(null), 1000);
        setSelectedWord(null); // Deselect word after an incorrect attempt
      }
    } else if (currentDroppedWord && !isMatched) {
      // No word selected, but there's an INCORRECTLY placed word in this slot, so undrop it
      handleUndropWord(qIdString);
    }
  }, [selectedWord, droppedWordsMap, matchedImageIds, handleUndropWord, currentRoundQuestions, correctSoundRef, incorrectSoundRef, setScore, setShowResultModal, setIsRunning, setHasWon, setIsGameOver, setTotalRoundsCompleted]);


  // handleSubmit - Now primarily for advancing round or game over check
  const handleSubmit = useCallback(() => {
    // If all are matched (due to immediate validation), end the game
    if (matchedImageIds.size === QUESTIONS_PER_ROUND) {
      correctSoundRef.current?.play().catch(console.error);
      setFeedbackMessage("All matched! Game Over!");
      setIsRunning(false);
      setHasWon(true);
      setIsGameOver(true);
      setShowResultModal(true);
      setTotalRoundsCompleted(1); // Mark one game as completed
    } else {
      // If not all matched, and attempts are exhausted, game over
      setIncorrectAttempts(prev => {
        const newAttempt = prev + 1; // Submitting when not all are correct also counts as an attempt
        if (newAttempt >= MAX_INCORRECT_ATTEMPTS) {
          setIsGameOver(true);
          setIsRunning(false);
          setHasWon(false);
          setShowResultModal(true);
        }
        return newAttempt;
      });
      incorrectSoundRef.current?.play().catch(console.error);
      setFeedbackMessage("Not all words matched correctly. Keep trying!");
      setTimeout(() => setFeedbackMessage(null), 1500);
    }
  }, [matchedImageIds, QUESTIONS_PER_ROUND, correctSoundRef, setShowResultModal, incorrectSoundRef, setTotalRoundsCompleted, setIsRunning, setHasWon, setIsGameOver]);

  // --- Effect Hooks ---

  useEffect(() => {
    correctSoundRef.current = new Audio("/correct.wav");
    incorrectSoundRef.current = new Audio("/incorrect.wav");
  }, []);

  useEffect(() => {
    // Initialize round only if not game over and questions data is available
    if (initialQuestionsData && initialQuestionsData.length > 0 && !isGameOver) {
      initializeRound();
    }
  }, [totalRoundsCompleted, initialQuestionsData, isGameOver, initializeRound]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && !isGameOver) { // Only run timer if not game over
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isGameOver]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !isGameOver && matchedImageIds.size === QUESTIONS_PER_ROUND) {
        // Only allow enter to submit if all are matched and game is not over
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleSubmit, isGameOver, matchedImageIds.size]);

  // Deselect word if escape key is pressed
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedWord(null);
        setFeedbackMessage(null); // Clear any pending feedback
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);


  // --- Conditional Rendering for Loading and No Questions ---
  if (isLoading) {
    return <Loading />;
  }

  if (!initialQuestionsData || initialQuestionsData.length === 0) {
    // If no questions, ensure game over and show result modal
    useEffect(() => {
      if (!isGameOver) { // Only set once
        setIsGameOver(true);
        setHasWon(false);
        setShowResultModal(true);
      }
    }, [isGameOver, setShowResultModal]);

    return (
      <div className="flex min-h-screen items-center justify-center text-2xl text-white">
        No questions available for this difficulty/topic!
        {/*
          No props are needed here because ResultModal pulls everything from the store.
          The 'showResultModal' state from the store will control its visibility.
        */}
        {showResultModal && <ResultModal />}
      </div>
    );
  }

  // --- Helper for time formatting ---
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

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

      <div className="relative z-10 flex flex-col items-center w-full flex-grow overflow-x-hidden">
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

              {/* Scoreboard and Timer Section */}
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
                      {formatTime(time)}
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

              {/* Main Game Content Area */}
              <div className="relative z-20 flex flex-col items-center flex-grow gap-4 lg:gap-6
                               bg-white/20 p-4 rounded-lg shadow-xl border border-yellow-400
                               w-full max-w-5xl md:max-w-4xl">

                {/* Image Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr w-full">
                  {currentRoundQuestions.map((q) => {
                    const qIdString = q.id.toString();
                    const isImageMatched = matchedImageIds.has(qIdString);
                    // The word in the slot is either the correct one (if matched) or the one from droppedWordsMap (if incorrectly placed)
                    const currentDisplayedWord = isImageMatched ? q.word : (droppedWordsMap.get(qIdString) || null);

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
                        {/* Image */}
                        <div className="mb-2 p-1 border border-gray-200 rounded-md bg-white flex-shrink-0 w-full">
                          <Image
                            src={typeof q.imageSrc === 'string' ? q.imageSrc : ''}
                            alt={q.word}
                            width={150}
                            height={112}
                            className="object-contain w-full h-auto max-h-[100px] md:max-h-[120px]"
                          />
                        </div>

                        {/* Blank Space / Drop Zone */}
                        <div
                          id={`drop-zone-${qIdString}`}
                          ref={(el) => (dropTargetRefs.current[qIdString] = el)}
                          className={`
                            w-full h-12 flex items-center justify-center
                            border-2 rounded-lg mb-2
                            ${isImageMatched ? 'border-green-500 bg-green-100 text-green-700' :
                             selectedWord && !currentDisplayedWord ? 'border-yellow-400 bg-yellow-50 animate-pulse' : /* Highlight empty droptarget if word is selected */
                             currentDisplayedWord ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-400 bg-gray-50'}
                            text-gray-800 text-sm sm:text-base md:text-lg font-bold uppercase
                            transition-colors duration-300 select-none
                            ${isImageMatched ? 'cursor-not-allowed' : 'cursor-pointer'}
                          `}
                          onClick={() => handleDropZoneClick(qIdString)}
                        >
                          {currentDisplayedWord || "Tap or drag word here"}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Draggable Word Choices */}
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
                    {availableChoices.map((draggableChoice) => {
                      // A word is 'matched' if it's correctly placed and locked
                      const isWordMatchedAndLocked = currentRoundQuestions.some(q => matchedImageIds.has(q.id.toString()) && q.word === draggableChoice.word);

                      const isSelected = selectedWord?.id === draggableChoice.id;

                      // Only hide words if they are matched and locked
                      const shouldHideWord = isWordMatchedAndLocked;

                      return (
                        <DraggableWord
                          key={draggableChoice.id}
                          word={draggableChoice.word}
                          id={draggableChoice.id}
                          onDragEnd={handleDragEnd}
                          onClick={handleDraggableWordClick}
                          isDropped={shouldHideWord} // Hide only if correctly placed
                          isDisabled={isWordMatchedAndLocked} // Disable dragging if matched
                          isSelected={isSelected}
                        />
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

                {/* Submit and Reset Buttons */}
              </div>
            </div>

            {/* Feedback Messages */}
            {feedbackMessage && (
              <AnimatePresence>
                <motion.div
                  key={feedbackMessage}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className={`mt-3 text-lg sm:text-xl font-bold ${
                    feedbackMessage.includes("Correct") || feedbackMessage.includes("All matched") ? "text-green-500" : "text-red-500"
                  }`}
                  aria-live="polite"
                >
                  {feedbackMessage}
                </motion.div>
              </AnimatePresence>
            )}
          </>
      </div>

      {/* Result Modal */}
      {showResultModal && (
        <ResultModal
        />
      )}
    </div>
  );
};