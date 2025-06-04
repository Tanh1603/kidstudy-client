"use client"; // If it uses client-side hooks or event listeners

import React, { useRef } from "react";

import Image from "next/image"; // For image content

import { Volume2, ImageOff } from "lucide-react"; // For icons

// Define the props that the Card component expects
interface CardProps {
  id: string; // Unique ID for the card instance
  contentType: "word" | "image" | "audio" | "text"; // Type of content to display
  content: string | File; // The actual content (word, image URL, audio URL)
  isFlipped: boolean;
  isMatched: boolean;
  onClick: (cardId: string) => void; // Function to call when card is clicked
  memoryType: string; // The original MemoryEnum type (e.g., "WORD_IMAGE") - useful for specific rendering
}

export const Card: React.FC<CardProps> = ({
  id,
  contentType,
  content,
  isFlipped,
  isMatched,
  onClick,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleCardClick = () => {
    // Only allow click if not flipped and not matched
    if (!isFlipped && !isMatched) {
      onClick(id);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.error("Error playing audio:", e));
    }
  };

  // Conditional styling based on card state
  const cardClasses = `
    relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40
    rounded-lg shadow-md cursor-pointer transition-transform duration-500 transform-gpu
    ${isFlipped || isMatched ? "rotate-y-180" : ""}
    ${isMatched ? "opacity-70" : ""}
  `;

  const cardFaceClasses = `
    absolute inset-0 backface-hidden rounded-lg flex items-center justify-center
    transition-all duration-500
  `;

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      {/* Card Back */}
      <div
        className={`${cardFaceClasses} bg-gradient-to-br from-blue-500 to-blue-700 text-white text-3xl font-bold`}
      >
        ?
      </div>

      {/* Card Front */}
      <div
        className={`${cardFaceClasses} bg-white border-2 border-gray-200 transform rotate-y-180 p-2`}
      >
        {isFlipped || isMatched ? ( // Only show content if flipped or matched
          <div className="flex flex-col items-center justify-center h-full w-full">
            {contentType === "word" || contentType === "text" ? (
              <span className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 text-center px-1">
                {content as string}
              </span>
            ) : contentType === "image" ? (
              typeof content === "string" ? (
                <Image
                  src={content}
                  alt="card-image"
                  width={90}
                  height={90}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                // Handle File type if necessary, e.g., createObjectURL
                <ImageOff className="text-gray-400 w-12 h-12" /> // Fallback icon
              )
            ) : contentType === "audio" ? (
              <div className="flex flex-col items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card flip on audio button click
                    playAudio();
                  }}
                  className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"
                >
                  <Volume2 className="w-8 h-8 text-blue-600" />
                </button>
                {typeof content === "string" && (
                  <audio ref={audioRef} src={content} />
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};