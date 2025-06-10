"use client";
import React, { useEffect } from "react";

import { useAuth } from "@clerk/nextjs";

import { updateUserPoints } from "@/app/services/user-progress";
import { useAddPointToQuest } from "@/hooks/use-quest-hook";
import { useSpellingBeeStore } from "@/store/use-game-spellingbee";


export const ResultModal: React.FC = () => {
  const {
    showResultModal,
    gameEndReason,
    score,
    wrongAnswers,
    setShowResultModal,
    setCurrentScreen,
    resetGame,
  } = useSpellingBeeStore();

  const addPoint = useAddPointToQuest();

  const { getToken, userId } = useAuth();

  useEffect(() => {
    const updatePoints = async () => {
      if (showResultModal && userId && score > 0) {
        const token = (await getToken()) as string;
        if (!token) {
          console.error("Token is not available");
          return;
        }
        await updateUserPoints(token, userId, score);
        await addPoint.mutateAsync(score);
      }
    };

    void updatePoints();
  }, [showResultModal, addPoint, getToken, score, userId]);

  if (!showResultModal) return null;

  // if (addPoint.isPending) return <Loading />;

  const isTimeOut = gameEndReason === "timeout";

  const closeModal = () => {
    setShowResultModal(false);
    setTimeout(() => {
      resetGame();
      setCurrentScreen("topics");
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4">
      <div className="hover:shadow-3xl w-full max-w-md rounded-3xl border-4 border-yellow-400 bg-white/95 p-4 shadow-2xl backdrop-blur-sm transition-all duration-300 sm:p-6 md:p-8">
        <div className="text-center">
          <div className="mb-4 sm:mb-6">
            {isTimeOut ? (
              <div className="mb-2 animate-bounce text-4xl sm:mb-4 sm:text-5xl md:text-6xl">
                ⏰
              </div>
            ) : (
              <div className="mb-2 animate-bounce text-4xl sm:mb-4 sm:text-5xl md:text-6xl">
                🏆
              </div>
            )}
            <h2 className="mb-2 text-2xl font-bold text-gray-800 sm:text-3xl">
              {isTimeOut ? "Time's Up!" : "Game Completed!"}
            </h2>
          </div>

          <div>
            <div className="mb-4 rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-100 to-yellow-200 p-3 shadow-lg transition-all duration-300 hover:shadow-xl sm:mb-6 sm:p-4 md:p-6">
              <div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
                <div className="rounded-xl border-2 border-blue-300 bg-gradient-to-br from-blue-100 to-blue-200 p-2 shadow-md transition-all duration-300 hover:shadow-lg sm:p-3 md:p-4">
                  <div className="text-2xl font-bold text-blue-600 sm:text-3xl">
                    {score}
                  </div>
                  <div className="text-xs font-semibold text-blue-700 sm:text-sm">
                    Score
                  </div>
                </div>
                <div className="rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-100 to-green-200 p-2 shadow-md transition-all duration-300 hover:shadow-lg sm:p-3 md:p-4">
                  <div className="text-2xl font-bold text-green-600 sm:text-3xl">
                    {Math.floor(score / 10)}
                  </div>
                  <div className="text-xs font-semibold text-green-700 sm:text-sm">
                    Correct
                  </div>
                </div>
                <div className="rounded-xl border-2 border-red-300 bg-gradient-to-br from-red-100 to-red-200 p-2 shadow-md transition-all duration-300 hover:shadow-lg sm:p-3 md:p-4">
                  <div className="text-2xl font-bold text-red-600 sm:text-3xl">
                    {wrongAnswers}
                  </div>
                  <div className="text-xs font-semibold text-red-700 sm:text-sm">
                    Wrong
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-2 sm:flex-row sm:gap-3">
              <button
                onClick={closeModal}
                className="w-full transform rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 sm:w-auto sm:px-6 sm:py-3 sm:text-base"
              >
                Choose New Topic
              </button>
              <button
                onClick={resetGame}
                className="w-full transform rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 sm:w-auto sm:px-6 sm:py-3 sm:text-base"
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
