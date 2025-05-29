import { useState, useEffect, useCallback } from "react";
import { shuffleArray } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import ProgressBar from "@/components/progressbar";
import { Header } from "./header";
import { AlertTriangle, Lightbulb } from "lucide-react"; // IMPORTANT: Using your specified icons
import GameEndScreen from "./game-end-screen";
type WordData = {
  id: number;
  word: string;
  image: string;
  letters: string[];
};

const words = [
  {
    id: 1,
    word: "CAT",
    image: "/cat.png",
    letters: ["C", "T", "A"],
  },
  {
    id: 2,
    word: "PARK",
    image: "/park.png",
    letters: ["P", "A", "K", "R"],
  },
  {
    id: 3,
    word: "DOG",
    image: "/dog.png",
    letters: ["D", "G", "O"],
  },
  // Add more words...
];

const typedWords: WordData[] = words;
const MAX_INCORRECT_ATTEMPTS = 5;

const Game = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswerLetters, setUserAnswerLetters] = useState<
    { letter: string; originalIndex: number; id: string }[]
  >([]);
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [incorrect, setIncorrect] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const currentWord = typedWords[currentWordIndex];

  useEffect(() => {
    if (!isGameOver && !hasWon) {
      const initialLetters = currentWord.letters.map((letter, index) => ({
        letter,
        originalIndex: index,
        id: `${currentWord.id}-${index}-${letter}`,
      }));
      setUserAnswerLetters(shuffleArray(initialLetters));
      setStatus("none");
      if (currentWordIndex === 0) {
        setTime(0);
        setIsRunning(true);
      }
    }
  }, [currentWordIndex, currentWord.word, currentWord.letters, currentWord.id, isGameOver, hasWon]);

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


  const handleSubmit = useCallback(() => {
    const userWord = userAnswerLetters.map((item) => item.letter).join("");

    if (userWord === currentWord.word) {
      setStatus("correct");
      setScore((prevScore) => prevScore + 1);

      if (currentWordIndex === typedWords.length - 1) {
        setIsRunning(false);
        setHasWon(true);
        setIsGameOver(true);
      } else {
        setTimeout(() => {
          setCurrentWordIndex((prevIndex) => prevIndex + 1);
        }, 1000);
      }
    } else {
      setStatus("wrong");
      setIncorrect((prev) => {
        const newAttempt = prev + 1;
        if (newAttempt >= MAX_INCORRECT_ATTEMPTS) {
          setIsGameOver(true);
          setIsRunning(false);
        }
        return newAttempt;
      });
    }
  }, [userAnswerLetters, currentWord.word, currentWordIndex, typedWords.length]);

  const handleReset = useCallback(() => {
    const initialLetters = currentWord.letters.map((letter, index) => ({
      letter,
      originalIndex: index,
      id: `${currentWord.id}-${index}-${letter}`,
    }));
    setUserAnswerLetters(shuffleArray(initialLetters));
    setStatus("none");
  }, [currentWord.letters, currentWord.word, currentWord.id]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !isGameOver && !hasWon) {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleSubmit, isGameOver, hasWon]);

  const restartGame = () => {
    setIsGameOver(false);
    setScore(0);
    setCurrentWordIndex(0);
    setIncorrect(0);
    setHasWon(false);
    setTime(0);
    setIsRunning(true);
  };

  return (
    <div className="flex flex-col items-center p-4">
      {isGameOver ? (
        <GameEndScreen
          score={score}
          time={time}
          onRestart={restartGame}
          hasWon={hasWon}
        />
      ) : (
        <>
          <Header
            currentWordIndex={currentWordIndex}
            totalWords={typedWords.length}
          />
          {/* This is the main container for the game content */}
          <div className="flex flex-col md:flex-row w-full items-center justify-center gap-10">

            {/* Score section - order it first on mobile (flex-col) and last on desktop (md:order-last) */}
            {/* THIS IS THE CORRECTED CONTAINER FOR TIMER, SCORE, AND ATTEMPTS */}
            <div className="flex flex-col items-center gap-4 order-first md:order-last">

                {/* Timer Background Image Container */}
                <div className="relative w-[200px] h-[100px] md:w-[200px] md:h-[100px] mb-4 overflow-hidden rounded-lg">
                    <Image
                        src="/animation/timer-background.png"
                        alt="Timer Background"
                        className="object-cover"
                        fill
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl font-bold font-mono text-white text-game-display">
                            {Math.floor(time / 60)}:{time % 60 < 10 ? `0${time % 60}` : time % 60}
                        </div>
                    </div>
                </div>

                {/* "Score:" Label Displayed Above the Scoreboard */}
                <div className="text-3xl font-bold font-mono text-yellow-400 text-game-display mb-2">
                    Score
                </div>

                {/* Score Board Image Container - Now only shows the score number */}
                <div className="relative w-[300px] h-[100px] md:w-[200px] md:h-[100px] mb-4 overflow-hidden rounded-lg">
                    <Image
                        src="/animation/score-board.jpg"
                        alt="Score Board"
                        className="object-contain" fill
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl font-bold font-mono text-white text-game-display">
                          {score} {/* Only the number here */}
                        </div>
                    </div>
                </div>

                {/*Attempts left*/}
                {(() => {
                    const attemptsLeft = 5 - incorrect;
                    let containerClasses = "flex items-center justify-center px-4 py-2 rounded-xl font-bold transition-colors duration-300 transform scale-100";
                    let textClasses = "text-lg";
                    let icon = null;

                    if (attemptsLeft <= 0) {
                        // This case might be handled by isGameOver, but for safety
                        containerClasses += " bg-gray-200 border-gray-400 text-gray-600 border-2";
                        icon = <Lightbulb className="mr-2 h-5 w-5 text-gray-500" />; // Or a 'disabled' icon
                    } else if (attemptsLeft <= 2) { // 1 or 2 attempts left
                        containerClasses += " bg-red-100 border-red-400 text-red-700 border-2";
                        icon = <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />;
                        if (attemptsLeft === 1) { // Add a pulsating effect for the very last attempt
                            containerClasses += " animate-pulse-fast"; // Custom animation, see CSS below
                        }
                    } else if (attemptsLeft <= 4) { // 3 or 4 attempts left
                        containerClasses += " bg-yellow-50 border-yellow-300 text-yellow-700 border-2";
                        icon = <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" />;
                    } else { // 5 attempts left (initial state)
                        containerClasses += " bg-green-50 border-green-200 text-green-600 border-2"; // Or blue-50, etc.
                        icon = <Lightbulb className="mr-2 h-5 w-5 text-green-500" />; // Or a 'check' icon
                    }

                    return (
                        <motion.div
                            key={attemptsLeft} // Key to trigger re-animation when attemptsLeft changes
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
            </div> {/* End of the main score section container */}


            {/* Picture and Letter section - order it second on mobile, first on desktop (NO CHANGE) */}
            <div className="flex flex-col items-center order-last md:order-first">
              <div className="mb-10">
                <Image
                  src={currentWord.image}
                  alt={currentWord.word}
                  width={500}
                  height={400}
                />
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentWord.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="w-full flex justify-center"
                >
                  <Reorder.Group
                    axis="x"
                    values={userAnswerLetters}
                    onReorder={setUserAnswerLetters}
                    className="flex gap-2 mb-6 p-2 border-2 border-dashed border-gray-300 rounded-md justify-center items-center"
                  >
                    {userAnswerLetters.map((item) => (
                      <Reorder.Item
                        key={item.id}
                        value={item}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-12 h-12 flex items-center justify-center text-xl font-bold cursor-grab"
                        style={{ zIndex: 10 }}
                      >
                        <Button variant={"primary"} className="text-white w-full h-full">
                          {item.letter}
                        </Button>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </motion.div>
              </AnimatePresence>

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
                  className="mb-4"
                >
                  Submit
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
                }}
                whileTap={{ scale: 0.9, rotate: 3 }}
              >
                <Button onClick={handleReset} variant={"super"}>
                  Reset
                </Button>
              </motion.div>
            </div>
          </div>

          {status === "correct" && <div className="mt-4 text-green-500">Correct!</div>}
          {status === "wrong" && (
            <div className="mt-4 text-red-500">
              Try Again! The correct word was:{" "}
              <strong>{currentWord.word}</strong>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Game;