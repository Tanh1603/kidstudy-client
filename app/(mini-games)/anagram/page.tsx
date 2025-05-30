/* eslint-disable import/order */
"use client";
import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Game, { Difficulty, GameType, GameWordData } from "./anagram";
import Loading from "@/components/loading";

const ANAGRAM_WORDS_FOR_GAME: GameWordData[] = [
  {
    id: 1,
    word: "CAT",
    imageSrc: "/animation/cat.jpg",
    letters: "CTAAAAAAAAAAA", // Make sure this is a scrambled version of "CAT" and not too long
  },
  {
    id: 2,
    word: "PARK",
    imageSrc: "/animation/park.jpg",
    letters: "PAKR",
  },
  {
    id: 3,
    word: "DOG",
    imageSrc: "/animation/dog.jpg",
    letters: "DGO",
  },
  {
    id: 4,
    word: "ELEPHANT",
    imageSrc: "/animation/cat.jpg",
    letters: "LPAHENET"
  },
  {
    id: 5,
    word: "KEYBOARD",
    imageSrc: "/animation/dog.jpg",
    letters: "YKBEARDO"
  },
  {
    id: 6,
    word: "TELEVISION",
    imageSrc: "/animation/cat.jpg",
    letters: "VILTEOISN"
  },
  {
    id: 7,
    word: "REFRIGERATOR",
    imageSrc: "/animation/cat.jpg",
    letters: "RFEGRTIOAERO"
  },
];

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
      <Game 
       topicId={1} // Example topic ID
       difficulty={Difficulty.MEDIUM} // Example difficulty
       gameType={GameType.ANAGRAM} // Example game type
       words={ANAGRAM_WORDS_FOR_GAME} />
    </main>
  );
};

export default Anagram;
