/* eslint-disable import/order */
import { useState, useEffect, useCallback } from "react";
import { words } from "@/data/word";
import { shuffleArray } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import ProgressBar from "@/components/progressbar";
type WordData = {
  id: number;
  word: string;
  image: string;
  letters: string[];
};

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

  type GameEndScreenProps = {
    score: number;
    time: number;
    onRestart: () => void;
    hasWon: boolean;
  };

  const GameEndScreen = ({ score, time, onRestart, hasWon }: GameEndScreenProps) => (
    <div className="text-center">
      <h2 className="text-3xl mb-4 font-bold">
        {hasWon ? "Congratulations, You Win!" : "Game Over!"}
      </h2>
      <p className="text-lg">Your final score is: {score}</p>
      <p className="text-lg">
        Time: {Math.floor(time / 60)}:{time % 60 < 10 ? `0${time % 60}` : time % 60}s
      </p>
      <Button onClick={onRestart} variant={"primary"} className="mt-6">
        Play Again
      </Button>
    </div>
  );

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
  }, [userAnswerLetters, currentWord.word, currentWordIndex]);

  const handleReset = useCallback(() => {
    const initialLetters = currentWord.letters.map((letter, index) => ({
      letter,
      originalIndex: index,
      id: `${currentWord.id}-${index}-${letter}`,
    }));
    setUserAnswerLetters(shuffleArray(initialLetters));
    setStatus("none");
  }, [currentWord.letters, currentWord.id]);

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
          <ProgressBar
            current={currentWordIndex + 1}
            total={typedWords.length}
          />

          <div className="flex w-full items-center justify-center gap-10">
            <div className="flex flex-col items-center">
              <div className="mb-10">
                <Image
                  src={currentWord.image}
                  alt={currentWord.word}
                  width={500}
                  height={400}
                />
              </div>

              {/* AnimatePresence wraps the Reorder.Group to enable enter/exit animations */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentWord.id} // Key changes each time a new word is loaded
                  initial={{ opacity: 0, scale: 0.8 }} // Start smaller and faded
                  animate={{ opacity: 1, scale: 1 }}    // Animate to full size and visible
                  exit={{ opacity: 0, scale: 0.8 }}     // Animate out smaller and faded
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="w-full flex justify-center" // Ensure it takes full width for centering
                >
                  <Reorder.Group
                    axis="x"
                    values={userAnswerLetters}
                    onReorder={setUserAnswerLetters}
                    className="flex gap-2 mb-6 p-2 border-2 border-dashed border-gray-300 rounded-md justify-center items-center"
                  >
                    {/* The individual Reorder.Items will also have their own animations */}
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

            <div className="flex flex-col items-center gap-4">
              <div className="relative w-[200px] h-[100px] mb-4">
                <Image
                  src="/timer-background.png"
                  alt="Timer Background"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl font-bold text-shadow text-black">
                    {Math.floor(time / 60)}:{time % 60 < 10 ? `0${time % 60}` : time % 60}
                  </div>
                </div>
              </div>

              <div className="text-lg">Score: {score}</div>
              <div className="text-lg">Incorrect Attempts: {incorrect}</div>
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