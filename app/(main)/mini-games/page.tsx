/* eslint-disable import/order */
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const MiniGamePage = () => {
  const games = [
    {
      id: 1,
      title: "Anagrams",
      description: "Rearrange letters to form words",
      image: "/animation/play_anagrams.png",
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      href: "/anagram",
    },
    {
      id: 2,
      title: "Match Up",
      description: "Match words with their meanings",
      image: "/animation/play_matchup.png",
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      href: "/match-up",
    },
    {
      id: 3,
      title: "Memory",
      description: "Test your memory skills",
      image: "/animation/play_memory.png",
      color: "from-yellow-400 to-yellow-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      href: "/memory",
    },
    {
      id: 4,
      title: "Spelling Bee",
      description: "Spell words correctly to earn points",
      image: "/animation/play_spellingbee.png",
      color: "from-red-400 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      href: "/mini-games/spelling-bee",
    },
  ];

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-7xl">
        {/* Header Section - Compact */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold text-gray-800 md:text-5xl">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mini Game
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Fun and educational games to boost your learning
          </p>
        </div>

        {/* Games Grid - Optimized for single screen */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {games.map((game, index) => (
            <div
              key={game.id}
              className="group transform cursor-pointer transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Container */}
              <div className="relative h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl">
                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
                />

                {/* Card Content */}
                <div className="relative p-6">
                  {/* Image Container - Smaller for better fit */}
                  <div
                    className={`relative mx-auto mb-4 h-20 w-20 overflow-hidden rounded-xl ${game.bgColor} transition-all duration-300 group-hover:rotate-3 group-hover:scale-110`}
                  >
                    <Image
                      src={game.image}
                      alt={game.title}
                      fill
                      sizes="(max-width: 768px) 80px, 80px"
                      className="object-contain p-3"
                    />
                  </div>

                  {/* Text Content */}
                  <div className="text-center">
                    <h3
                      className={`mb-2 text-xl font-bold transition-all duration-300 ${game.iconColor} group-hover:scale-105`}
                    >
                      {game.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-gray-600">
                      {game.description}
                    </p>

                    {/* Play Button - Smaller */}
                    <Link href={game.href}>
                      <Button
                        className={`w-full bg-gradient-to-r ${game.color} transform rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                      >
                        Play Now
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Floating Icons */}
                <div
                  className={`absolute right-3 top-3 h-6 w-6 rounded-full bg-gradient-to-br ${game.color} opacity-20 transition-all duration-300 group-hover:opacity-40`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA - Compact */}
        <div className="mt-8 text-center">
          <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-center">
              <span className="mr-2 text-2xl">🎯</span>
              <h2 className="text-xl font-semibold text-gray-800">
                Ready to challenge yourself?
              </h2>
            </div>
            <p className="text-gray-600">
              Pick your favorite game and start learning today!
            </p>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute left-10 top-20 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-purple-200 to-indigo-200 opacity-20 blur-2xl" />
        <div
          className="absolute bottom-20 right-10 h-40 w-40 animate-pulse rounded-full bg-gradient-to-br from-blue-200 to-purple-200 opacity-20 blur-2xl"
          style={{ animationDelay: "1s" }}
        />
      </div>
    </div>
  );
};

export default MiniGamePage;
