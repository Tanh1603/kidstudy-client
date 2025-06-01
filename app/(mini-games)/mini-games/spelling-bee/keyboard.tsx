/* eslint-disable import/order */
"use client";
import React from "react";
import { RotateCcw } from "lucide-react";
import { useSpellingBeeStore } from "@/store/use-game-spellingbee";

interface KeyboardProps {
  onKeyPress: (letter: string) => void;
  onBackspace: () => void;
  disabled: boolean;
}

const keyboard = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export const Keyboard: React.FC<KeyboardProps> = ({
  onKeyPress,
  onBackspace,
  disabled,
}) => {
  const { resetGame } = useSpellingBeeStore();

  return (
    <div className="space-y-1 sm:space-y-2">
      {keyboard.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 sm:gap-2">
          {row.map((letter) => (
            <button
              key={letter}
              onClick={() => onKeyPress(letter)}
              disabled={disabled}
              className="h-8 w-8 transform rounded-lg bg-gradient-to-b from-gray-200 to-gray-300 text-base font-bold shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 disabled:opacity-50 sm:h-10 sm:w-10 sm:text-lg md:h-12 md:w-12 md:text-xl"
            >
              {letter}
            </button>
          ))}
        </div>
      ))}

      {/* Bottom Row with Controls */}
      <div className="mt-2 flex justify-center gap-1 sm:mt-4 sm:gap-2">
        <button
          onClick={resetGame}
          className="transform rounded-lg bg-gradient-to-r from-green-500 to-green-600 p-2 text-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 sm:p-3"
        >
          <RotateCcw size={16} className="sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={onBackspace}
          disabled={disabled}
          className="transform rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-base font-bold text-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 disabled:opacity-50 sm:px-6 sm:py-3 sm:text-lg"
        >
          ←
        </button>
      </div>
    </div>
  );
};
