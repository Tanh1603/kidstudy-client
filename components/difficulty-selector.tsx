// components/difficulty-selector.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { DifficultyEnum } from "@/app/models/Game"; // Adjust path as needed
import { motion } from "framer-motion";

interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: DifficultyEnum) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  onSelectDifficulty,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900 p-4">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl md:text-6xl font-extrabold text-white mb-10 text-center drop-shadow-lg"
      >
        Choose Your Challenge
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        {Object.values(DifficultyEnum).map((difficulty) => (
          <motion.div
            key={difficulty}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 + (difficulty === DifficultyEnum.EASY ? 0 : difficulty === DifficultyEnum.MEDIUM ? 0.1 : 0.2) }}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 flex flex-col items-center justify-center border border-white border-opacity-20 shadow-xl overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: "url('/patterns/geometric.svg')", backgroundSize: "cover" }}></div>

            <h2 className="relative z-10 text-3xl font-bold text-white mb-4 uppercase">
              {difficulty}
            </h2>
            <p className="relative z-10 text-white text-center text-opacity-80 mb-6">
              {difficulty === DifficultyEnum.EASY && "Perfect for beginners, a relaxed pace to learn and enjoy."}
              {difficulty === DifficultyEnum.MEDIUM && "A balanced challenge, testing your skills without overwhelming you."}
              {difficulty === DifficultyEnum.HARD && "For the masters! A true test of speed and word prowess."}
            </p>
            <Button
              onClick={() => onSelectDifficulty(difficulty)}
              variant="super" // Assuming 'super' is a vibrant button style from your UI library
              className="relative z-10 text-lg px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            >
              Start {difficulty}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector;