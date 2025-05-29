/* eslint-disable import/order */
"use client";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Game from "./anagram";
import Loading from "@/components/loading";

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

    void fetchAnagram();
  }, [userId, getToken]);

  if (loading) return <Loading />;

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Game />
    </main>
  );
};

export default Anagram;
