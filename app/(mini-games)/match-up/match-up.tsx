// app/(mini-games)/match-up/game.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/ui/header-game";
import GameEndScreen from "./game-end-screen";
import { shuffleArray } from "@/lib/utils";
import { Footer } from "@/components/ui/footer-game";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lightbulb } from "lucide-react";

import { DifficultyEnum, GameTypeEnum } from "@/app/models/Game";
import { MatchUpGameData } from "./page"; // Import the data type from page.tsx

interface GameProps {
  topicId: number;
  difficulty: DifficultyEnum;
  gameType: GameTypeEnum;
  questions: MatchUpGameData[];
}

// Define a type for your draggable choices
interface DraggableChoice {
  word: string;
  id: string; // Unique ID for this draggable instance
}

// Draggable Word component
interface DraggableWordProps {
  word: string;
  id: string; // Unique ID for the draggable element itself
  onDragEnd: (info: any, wordId: string, word: string) => void; // Pass wordId as well
  isDropped: boolean; // To hide the word if it's already dropped
  isDisabled: boolean; // To disable dragging for already matched words
}

const DraggableWord: React.FC<DraggableWordProps> = ({ word, id, onDragEnd, isDropped, isDisabled }) => {
  return (
    <motion.div
      className={`
        bg-blue-500 text-white font-bold text-lg sm:text-xl md:text-2xl
        px-4 py-2 rounded-lg shadow-md flex-shrink-0
        transition-opacity duration-300 select-none
        ${isDropped ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab'}
        relative z-30
      `}
      drag={!isDisabled} // Only allow drag if not disabled
      dragSnapToOrigin // Snaps back if not dropped on a target
      onDragEnd={(event, info) => onDragEnd(info, id, word)} // Pass id here
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95, cursor: 'grabbing' } : {}}
      key={id} // Use the stable unique id as the key
    >
      {word}
    </motion.div>
  );
};


export const Game = ({ topicId, difficulty, gameType, questions: initialQuestionsData }: GameProps) => {
  // Defensive check for initialQuestionsData:
  if (!Array.isArray(initialQuestionsData) || initialQuestionsData.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center text-2xl text-white">
        No questions available for this difficulty/topic!
      </div>
    );
  }

  // --- State Declarations ---
  const [currentRoundQuestions, setCurrentRoundQuestions] = useState<MatchUpGameData[]>([]);
  const [droppedWordsMap, setDroppedWordsMap] = useState<Map<string, string>>(new Map()); // Map: imageId -> droppedWord
  const [matchedImageIds, setMatchedImageIds] = useState<Set<string>>(new Set()); // Set of image IDs that are correctly matched
  const [availableChoices, setAvailableChoices] = useState<DraggableChoice[]>([]); // Words to drag (all words in the round), now with unique IDs
  const [totalRoundsCompleted, setTotalRoundsCompleted] = useState(0); // Tracks completed sets of 8
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [score, setScore] = useState(0); // Score state
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Constants
  const QUESTIONS_PER_ROUND = 8; // Display 8 images at a time (2x4 grid implies 8 cards)
  const MAX_INCORRECT_ATTEMPTS = 10; // Increased attempts for more complex round

  // --- Utility to get drop zone rects ---
  const getDropZoneRects = useCallback(() => {
    const rects: Map<string, DOMRect> = new Map();
    currentRoundQuestions.forEach(q => {
      const element = document.getElementById(`drop-zone-${q.id}`);
      if (element) {
        rects.set(q.id, element.getBoundingClientRect());
      }
    });
    return rects;
  }, [currentRoundQuestions]);

  // --- Memoized Callbacks ---
  const initializeRound = useCallback(() => {
    // Calculate the start index for the current round, using modulo to loop back to the beginning
    // of initialQuestionsData if we've gone past the end.
    const startIndex = (totalRoundsCompleted * QUESTIONS_PER_ROUND) % initialQuestionsData.length;
    let newRoundQuestions: MatchUpGameData[] = [];

    // Populate newRoundQuestions by taking QUESTIONS_PER_ROUND items,
    // looping back to the start of initialQuestionsData if needed.
    for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
        const questionIndex = (startIndex + i) % initialQuestionsData.length;
        newRoundQuestions.push(initialQuestionsData[questionIndex]);
    }

    // This check is a safeguard, though with the modulo logic, newRoundQuestions should
    // always have QUESTIONS_PER_ROUND items if initialQuestionsData.length > 0.
    if (newRoundQuestions.length === 0) { // This can only happen if initialQuestionsData was empty to begin with.
        console.warn("No questions available in initialQuestionsData to start a round, even with looping logic.");
        setIsRunning(false);
        setIsGameOver(true);
        setHasWon(false);
        return;
    }

    // Shuffle the questions for the current round to ensure variety and prevent predictable order
    newRoundQuestions = shuffleArray(newRoundQuestions);

    setCurrentRoundQuestions(newRoundQuestions);
    setDroppedWordsMap(new Map()); // Clear dropped words for new round
    setMatchedImageIds(new Set()); // Clear matched images for new round

    // Prepare all words from the current round for dragging
    // Include all choices to populate the draggable area
    const allPossibleChoicesInRound = new Set<string>();
    newRoundQuestions.forEach(q => {
      q.choices.forEach(choice => allPossibleChoicesInRound.add(choice));
    });

    // Generate unique IDs for each draggable word instance
    const shuffledAndIdChoices: DraggableChoice[] = shuffleArray(Array.from(allPossibleChoicesInRound)).map(word => ({
      word,
      id: `${word}-${crypto.randomUUID()}` // Use crypto.randomUUID() for robust uniqueness
    }));

    setAvailableChoices(shuffledAndIdChoices);
    setFeedbackMessage(null);

    if (totalRoundsCompleted === 0) { // Start timer only on first round
      setTime(0);
      setIsRunning(true);
    }

  }, [initialQuestionsData, totalRoundsCompleted]);

  // Handle drag end event
  const handleDragEnd = useCallback((info: any, draggableWordId: string, word: string) => {
    const dropZoneRects = getDropZoneRects();
    let droppedOnImageId: string | null = null;

    for (const [imageId, rect] of dropZoneRects.entries()) {
      const dropX = info.point.x;
      const dropY = info.point.y;

      if (
        dropX >= rect.left &&
        dropX <= rect.right &&
        dropY >= rect.top &&
        dropY <= rect.bottom
      ) {
        // Make sure we're not dropping on an already matched slot
        if (!matchedImageIds.has(imageId)) {
          droppedOnImageId = imageId;
          break;
        }
      }
    }

    setDroppedWordsMap(prevMap => {
      const newMap = new Map(prevMap);

      // If the word was previously dropped somewhere, remove it from that spot
      // This allows moving words between blanks, UNLESS it's a correct, locked match
      for (let [key, value] of newMap.entries()) {
        if (value === word) {
          // If the word was previously dropped on a spot that is now matched, do not clear it
          if (!matchedImageIds.has(key)) {
            newMap.delete(key);
          }
          break;
        }
      }

      if (droppedOnImageId) {
        newMap.set(droppedOnImageId, word);
      }
      return newMap;
    });

  }, [getDropZoneRects, matchedImageIds, currentRoundQuestions]);

  // NEW: Handle clicking a dropped word to return it to choices
  const handleUndropWord = useCallback((imageId: string) => {
    setDroppedWordsMap(prevMap => {
      const newMap = new Map(prevMap);
      if (newMap.has(imageId) && !matchedImageIds.has(imageId)) {
        // Only undrop if it's not a matched word
        newMap.delete(imageId);
      }
      return newMap;
    });
  }, [matchedImageIds]);


  const handleSubmit = useCallback(() => {
    let newMatchesCount = 0;
    const newMatchedImageIds = new Set(matchedImageIds); // Start with previously matched items

    currentRoundQuestions.forEach(q => {
      const dropped = droppedWordsMap.get(q.id);
      if (dropped && dropped === q.correctWord) {
        if (!newMatchedImageIds.has(q.id)) { // Only count as new match if not already in the set
            newMatchesCount++;
        }
        newMatchedImageIds.add(q.id); // Add to set of matched images
      }
    });

    setMatchedImageIds(newMatchedImageIds);
    setScore(newMatchedImageIds.size); // Update total score to the count of all correctly matched images

    if (newMatchedImageIds.size === QUESTIONS_PER_ROUND) {
      setFeedbackMessage("All matched! Moving to next round.");
      setIsRunning(false); // Pause timer while feedback is shown
      setTimeout(() => {
        setTotalRoundsCompleted(prev => prev + 1);
        setIsRunning(true); // Resume timer for next round
      }, 1500); // Short delay before next round
    } else {
      setFeedbackMessage("Keep going! Some matches are still incorrect or missing.");
      setIncorrectAttempts(prev => {
        const newAttempt = prev + 1;
        if (newAttempt >= MAX_INCORRECT_ATTEMPTS) {
          setIsGameOver(true);
          setIsRunning(false);
          setHasWon(false); // Game over due to attempts, not win
        }
        return newAttempt;
      });
      // Clear incorrect drops for user to retry easily
      setTimeout(() => {
        setDroppedWordsMap(prevMap => {
          const updatedMap = new Map(prevMap);
          currentRoundQuestions.forEach(q => {
            if (!newMatchedImageIds.has(q.id)) { // Only clear if not already correctly matched
              updatedMap.delete(q.id);
            }
          });
          return updatedMap;
        });
        setFeedbackMessage(null);
      }, 1000);
    }
  }, [currentRoundQuestions, droppedWordsMap, matchedImageIds, MAX_INCORRECT_ATTEMPTS]);


  const handleReset = useCallback(() => {
    // Reset only the current dropped words and feedback, not score or attempts
    setDroppedWordsMap(new Map());
    setFeedbackMessage(null);
    setMatchedImageIds(new Set()); // Also reset matched for current round
    // Re-initialize available choices based on current round questions
    const allPossibleChoicesInRound = new Set<string>();
    currentRoundQuestions.forEach(q => {
      q.choices.forEach(choice => allPossibleChoicesInRound.add(choice));
    });
    const shuffledAndIdChoices: DraggableChoice[] = shuffleArray(Array.from(allPossibleChoicesInRound)).map(word => ({
      word,
      id: `${word}-${crypto.randomUUID()}`
    }));
    setAvailableChoices(shuffledAndIdChoices);
  }, [currentRoundQuestions]);

  const restartGame = useCallback(() => {
    setIsGameOver(false);
    setScore(0);
    setTotalRoundsCompleted(0);
    setIncorrectAttempts(0);
    setHasWon(false);
    setTime(0);
    setIsRunning(true);
    // droppedWordsMap, matchedImageIds, availableChoices will be reset by initializeRound
    setFeedbackMessage(null);
    // initializeRound will be called by useEffect due to totalRoundsCompleted change
  }, []);


  // --- Effects (useEffect) ---
  useEffect(() => {
    if (!isGameOver && !hasWon) {
      initializeRound();
    }
  }, [totalRoundsCompleted, isGameOver, hasWon, initialQuestionsData.length, initializeRound]); // Added initializeRound to dependencies

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

  // Keyboard shortcut for Enter to submit
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !isGameOver && !hasWon && currentRoundQuestions.length > 0) {
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleSubmit, isGameOver, hasWon, currentRoundQuestions.length]);

  const canSubmit = droppedWordsMap.size > 0 && matchedImageIds.size < QUESTIONS_PER_ROUND;

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
        currentWordIndex={totalRoundsCompleted} // Now represents rounds completed
        totalWords={Math.ceil(initialQuestionsData.length / QUESTIONS_PER_ROUND)} // Total possible rounds
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
              // This is the main container that holds both the scoreboard/timer and the game content.
              // It remains flex-col on small screens, and flex-row on medium screens (md:flex-row)
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

              {/* Scoreboard and Timer Section (This remains on one side on md+) */}
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
                      let textClasses = "text-sm sm:text-base md:text-lg";
                      let icon = null;
                      let iconClasses = "mr-1 h-4 w-4 sm:h-5 sm:w-5";

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

              {/* Main Game Content Area - This is where the image grid, words, and buttons live. */}
              {/* This wrapper remains flex-col on all screens to stack its children vertically. */}
              <div className="relative z-20 flex flex-col items-center flex-grow gap-4 lg:gap-6
                              bg-white/20 p-4 rounded-lg shadow-xl border border-yellow-400
                              w-full max-w-5xl md:max-w-4xl"> {/* Adjusted max-width for better fit when next to timer */}

                {/* Image Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr w-full">
                  {currentRoundQuestions.map((q) => {
                    const isImageMatched = matchedImageIds.has(q.id);
                    const currentDroppedWord = droppedWordsMap.get(q.id) || null;

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
                            src={q.imageSrc}
                            alt={q.correctWord}
                            width={150} // Adjusted for grid
                            height={112} // Adjusted for grid
                            className="object-contain w-full h-auto max-h-[100px] md:max-h-[120px]"
                          />
                        </div>

                        {/* Blank Space / Drop Zone */}
                        <div
                          id={`drop-zone-${q.id}`} // Unique ID for each drop zone
                          className={`
                            w-full h-12 flex items-center justify-center
                            border-2 rounded-lg mb-2
                            ${isImageMatched ? 'border-green-500 bg-green-100 text-green-700' :
                           currentDroppedWord ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-400 bg-gray-50'}
                            text-gray-800 text-sm sm:text-base md:text-lg font-bold uppercase
                            transition-colors duration-300 select-none
                            ${isImageMatched ? 'cursor-not-allowed' : currentDroppedWord ? 'cursor-pointer' : ''}
                          `}
                          onClick={() => { // ADDED onClick handler
                              if (currentDroppedWord && !isImageMatched) {
                                  handleUndropWord(q.id);
                              }
                          }}
                        >
                          {isImageMatched ? q.correctWord : (currentDroppedWord || "Drag word here")}
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
                      {availableChoices.map((draggableChoice) => { // Iterate over DraggableChoice objects
                        const isWordDropped = Array.from(droppedWordsMap.values()).includes(draggableChoice.word);
                        const isWordMatched = currentRoundQuestions.some(q => matchedImageIds.has(q.id) && q.correctWord === draggableChoice.word);
                        return (
                          <DraggableWord
                            key={draggableChoice.id} // Use the unique ID from the object as the key
                            word={draggableChoice.word}
                            id={draggableChoice.id} // Pass the unique ID
                            onDragEnd={handleDragEnd}
                            isDropped={isWordDropped && !isWordMatched}
                            isDisabled={isWordMatched}
                          />
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>


                {/* Submit and Reset Buttons */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                  }}
                  whileTap={{ scale: 0.9, rotate: 3 }}
                  className="mt-6 flex gap-4" // Keep mt-6 for vertical spacing
                >
                  <Button
                    onClick={handleSubmit}
                    variant={"super"}
                    className="text-lg sm:text-xl px-6 py-2 sm:px-8 sm:py-3"
                    disabled={!canSubmit}
                  >
                    Submit Round
                  </Button>
                  <Button onClick={handleReset} variant={"super"}
                   className="text-lg sm:text-xl px-6 py-2 sm:px-8 sm:py-3">
                    Reset Current
                  </Button>
                </motion.div>
              </div> {/* END Main Game Content Area */}

            </div> {/* END Main game container with anagram-bg2.jpg background */}

            {/* Feedback Messages */}
            {feedbackMessage && (
                <motion.div
                    key={feedbackMessage} // Key to trigger animation on message change
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`mt-3 text-lg sm:text-xl font-bold ${
                        feedbackMessage.includes("All matched") ? "text-green-500" : "text-yellow-500"
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