"use client";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Game from "./anagram";

const Anagram = () => {
  const { userId, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAnagram = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        console.log(token);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnagram();
  }, [userId, getToken]);

return (
  <main className="min-h-screen flex items-center justify-center">
    <Game />
  </main>
);
};

export default Anagram;