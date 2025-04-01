"use client";
import { createContext, useContext, useEffect, useState } from "react";
import ChallengeDTO, { ChallengeDTOCreate } from "@/app/models/ChallengeDTO";
import { useAuth } from "@clerk/nextjs";
import { getChallenges } from "@/app/services/admin/challenges";

interface ChallengeContextType {
  challenges: ChallengeDTO[];
  setChallenges: (challenges: ChallengeDTO[]) => void;
  isChallengeModalOpen: boolean;
  currentChallenge: ChallengeDTO | null;
  setIsChallengeModalOpen: (isChallengeModalOpen: boolean) => void;
  setCurrentChallenge: (currentChallenge: ChallengeDTO | null) => void;
  addChallenge: (challenge: ChallengeDTOCreate) => void;
  updateChallenge: (challenge: ChallengeDTO) => void;
  deleteChallenge: (id: number) => void;
}
const ChallengeContext = createContext<ChallengeContextType>({
  challenges: [],
  setChallenges: () => {},
  isChallengeModalOpen: false,
  currentChallenge: null,
  setIsChallengeModalOpen: () => {},
  setCurrentChallenge: () => {},
  addChallenge: () => {},
  updateChallenge: () => {},
  deleteChallenge: () => {},
});

export const ChallengeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [challenges, setChallenges] = useState<ChallengeDTO[]>([]);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeDTO | null>(
    null
  );
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchChallenges = async () => {
      const token = await getToken();
      if (!token) return;
      const challenges = await getChallenges(token);
      setChallenges(challenges);
    };
    void fetchChallenges();
  }, [getToken]);

  const addChallenge = (challenge: ChallengeDTOCreate) => {
    setChallenges([...challenges, challenge as ChallengeDTO]);
  };

  const updateChallenge = (challenge: ChallengeDTO) => {
    setChallenges(
      challenges.map((c) => (c.id === challenge.id ? challenge : c))
    );
  };

  const deleteChallenge = (id: number) => {
    setChallenges(challenges.filter((c) => c.id !== id));
  };

  return (
    <ChallengeContext.Provider
      value={{
        challenges,
        setChallenges,
        isChallengeModalOpen,
        setIsChallengeModalOpen,
        currentChallenge,
        setCurrentChallenge,
        addChallenge,
        updateChallenge,
        deleteChallenge,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallenges = () => {
  return useContext(ChallengeContext);
};
