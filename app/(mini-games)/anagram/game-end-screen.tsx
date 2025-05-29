// components/game-end-screen.tsx
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

// Define the props type for GameEndScreen
// You can keep this here, or move it to a shared types file (e.g., types/game.ts)
type GameEndScreenProps = {
  score: number;
  time: number;
  onRestart: () => void;
  hasWon: boolean;
};

const GameEndScreen = ({ score, time, onRestart, hasWon }: GameEndScreenProps) => (
  <motion.div
    className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
  >
    <div className="bg-gray-800 border-4 border-gray-600 p-8 rounded-xl shadow-2xl text-center max-w-lg w-full">
      <h2 className={`text-5xl font-extrabold font-mono mb-6 ${hasWon ? 'text-green-400' : 'text-red-400'} text-game-display`}>
        {hasWon ? "YOU WIN!" : "GAME OVER!"}
      </h2>

      <p className="text-3xl font-bold font-mono text-yellow-300 mb-4 text-game-display">
        Final Score: {score}
      </p>

      <p className="text-2xl font-mono text-gray-200 mb-8">
        Time: {Math.floor(time / 60)}:{time % 60 < 10 ? `0${time % 60}` : time % 60}s
      </p>

      <Button onClick={onRestart} variant={"primary"} className="mt-8 px-8 py-3 text-lg">
        Play Again
      </Button>
    </div>
  </motion.div>
);

export default GameEndScreen;