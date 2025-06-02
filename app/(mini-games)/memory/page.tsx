"use client";
import { useState, useEffect } from "react";

import { useAuth } from "@clerk/nextjs";

import Game from "./memory";

const Memory = () => {
  const { userId, getToken } = useAuth();
  const [, setLoading] = useState(true);
  useEffect(() => {
    const fetchMemory = async () => {
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

    void fetchMemory();
  }, [userId, getToken]);

return (
  <main className="min-h-screen flex items-center justify-center">
    <Game />
  </main>
);
};

export default Memory;