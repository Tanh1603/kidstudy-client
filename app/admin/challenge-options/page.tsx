/* eslint-disable import/order */
"use client";
import ChallengeOptionDTO from "@/app/models/ChallengeOptionDTO";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { getChallengeOptions } from "@/app/services/admin/challenge-options";
import { TableComponent } from "@/components/table";

const ChallengeOptionsPage = () => {
  const { getToken } = useAuth();
  const [challengeOptions, setChallengeOptions] = useState<
    ChallengeOptionDTO[]
  >([]);

  useEffect(() => {
    const fetchChallengeOptions = async () => {
      const token = await getToken();
      if (!token) {
        return;
      }
      const challengeOptions = await getChallengeOptions(token);
      setChallengeOptions(challengeOptions);
    };
    void fetchChallengeOptions();
  }, [getToken]);

  return (
    <TableComponent
      headers={["id", "challengeId", "text", "correct", "imageSrc", "audioSrc"]}
      data={challengeOptions.map((challengeOption) => ({
        id: challengeOption.id.toString(),
        challengeId: challengeOption.challengeId.toString(),
        text: challengeOption.text,
        correct: challengeOption.correct.toString(),
        imageSrc: challengeOption.imageSrc,
        audioSrc: challengeOption.audioSrc,
      }))}
    />
  );
};

export default ChallengeOptionsPage;
