/* eslint-disable import/order */
"use client";
import { useMemoryStore } from "@/store/use-game-memory";
import React from "react";
import { DifficultyEnum } from "../../models/Game";

export const DifficultyScreen: React.FC = () => {
  const { setSelectedDifficulty, setCurrentScreen } = useMemoryStore();

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-300 via-blue-400 to-blue-500 p-2 sm:p-4"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c20-10 40 10 60 0s40 10 60 0v60H0z' fill='%23D4A574' opacity='0.3'/%3E%3Cpath d='M0 60c20-10 40 10 60 0s40 10 60 0v40H0z' fill='%23D4A574' opacity='0.2'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat-x",
        backgroundPosition: "bottom",
      }}
    >
      <div className="w-full max-w-md text-center">
        <div className="mb-4 rounded-3xl border-4 border-gray-300 bg-white/90 p-4 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl sm:mb-6 sm:p-6">
          <h1 className="bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-3xl font-bold text-transparent drop-shadow-lg sm:text-4xl md:text-5xl">
            Spelling Bee
          </h1>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {Object.values(DifficultyEnum).map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => {
                setSelectedDifficulty(difficulty);
                setCurrentScreen("topics");
              }}
              className="mx-auto block w-full max-w-[320px] transform rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 sm:px-8 sm:py-4 sm:text-2xl"
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
