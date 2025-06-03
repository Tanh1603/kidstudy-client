/* eslint-disable import/order */
"use client";
import { useMatchUpStore } from "@/store/use-game-matchup";
import React from "react";
import TopicDTO from "../../models/TopicDTO";
import Image from "next/image";
import { useGetTopicUser } from "@/hooks/use-topic-hook";
import Loading from "@/components/loading";

export const TopicsScreen: React.FC = () => {
  const { setCurrentScreen, setSelectedTopic, setIsGameActive } =
    useMatchUpStore();

  const { data: topics, isLoading } = useGetTopicUser();

  if (isLoading) return <Loading />;
  if (!topics || topics.length === 0) {
    return (
      <div className="text-center text-red-600">
        No topics available for this difficulty.
      </div>
    );
  }

  const startGame = (topic: TopicDTO) => {
    setSelectedTopic(topic);
    setCurrentScreen("game");
    setIsGameActive(true);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-300 via-blue-400 to-blue-500 p-2 sm:p-4"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c20-10 40 10 60 0s40 10 60 0v60H0z' fill='%23D4A574' opacity='0.3'/%3E%3Cpath d='M0 60c20-10 40 10 60 0s40 10 60 0v40H0z' fill='%23D4A574' opacity='0.2'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat-x",
        backgroundPosition: "bottom",
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border-4 border-blue-200 bg-white/90 p-4 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl sm:p-6 md:p-8">
          <div className="mb-4 rounded-2xl border-2 border-yellow-400 bg-gradient-to-r from-yellow-200 to-yellow-300 p-3 shadow-lg transition-all duration-300 hover:shadow-xl sm:mb-6 sm:p-4">
            <h2 className="text-center text-2xl font-bold text-gray-800 sm:text-3xl">
              Select Content
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6 xl:grid-cols-8">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => void startGame(topic)}
                className="transform rounded-xl border-2 border-gray-300 bg-white/90 p-2 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-xl active:scale-95 sm:p-3 md:p-4"
              >
                <div className="mb-1 flex items-center justify-center sm:mb-2">
                  <Image
                    src={topic.icon}
                    alt={topic.title}
                    width={32}
                    height={32}
                    className="h-8 w-8 transform transition-all duration-300 hover:scale-110 sm:h-10 sm:w-10 md:h-12 md:w-12"
                  />
                </div>
                <div className="truncate text-xs font-semibold text-red-600 transition-colors duration-300 hover:text-red-700 sm:text-sm">
                  {topic.title}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-center sm:mt-6">
            <button
              onClick={() => setCurrentScreen("difficulty")}
              className="transform rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 sm:px-6 sm:text-base"
            >
              Back to Difficulty
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};