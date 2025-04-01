/* eslint-disable import/order */
"use client";
import { useState } from "react";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import ChallengeDTO from "@/app/models/ChallengeDTO";
import { getChallenges } from "@/app/services/admin/challenges";
import { TableComponent } from "@/components/table";        
const ChallengesPage = () => {
  const { getToken } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeDTO[]>([]);

  useEffect(() => {
    const fetchChallenges = async () => {
      const token = await getToken();
      if (!token) {         
        return;
      }
      const challenges = await getChallenges(token);
      setChallenges(challenges);
    };
    void fetchChallenges();
  }, [getToken]);

  return <TableComponent headers={["id", "type", "question", "audioSrc", "order"]} data={challenges.map((challenge) => ({
    id: challenge.id.toString(),
    type: challenge.type,
    question: challenge.question,
    audioSrc: challenge.audioSrc,
    order: challenge.order,
  }))} />;
};  

export default ChallengesPage;
