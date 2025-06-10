// components/topic-selector.tsx
"use client"; // Important for client-side interactivity and hooks

import React from "react";

import { motion } from "framer-motion"; // For animations

import { Button } from "@/components/ui/button"; // Assuming you have a Button component

interface Topic {
  id: number;
  name: string;
}

interface TopicSelectorProps {
  topics: Topic[];
  onSelectTopic: (topicId: number) => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ topics, onSelectTopic }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900 p-4">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl md:text-6xl font-extrabold text-white mb-10 text-center drop-shadow-lg"
      >
        Choose Your Topic
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        {topics.map((topic, index) => (
          <motion.div
            key={topic.id} // Use topic.id as the key
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            // Stagger animation delay based on index for a nicer effect
            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 + (index * 0.1) }}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 flex flex-col items-center justify-center border border-white border-opacity-20 shadow-xl overflow-hidden"
          >
            {/* Background pattern - adjust path if different */}
            <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: "url('/patterns/geometric.svg')", backgroundSize: "cover" }}></div>

            <h2 className="relative z-10 text-3xl font-bold text-white mb-4 uppercase">
              {topic.name}
            </h2>
            <p className="relative z-10 text-white text-center text-opacity-80 mb-6">
              {/* Optional: Add a short description for each topic if you have one */}
              Explore words related to {topic.name.toLowerCase()}.
            </p>
            <Button
              onClick={() => onSelectTopic(topic.id)}
              variant="super" // Use your 'super' variant for consistency
              className="relative z-10 text-lg px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            >
              Select {topic.name}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TopicSelector;