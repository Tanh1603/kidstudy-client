"use client";
import { createContext, useContext, useEffect, useState } from "react";
import ChallengeOptionDTO, {
  ChallengeOptionDTOCreate,
} from "@/app/models/ChallengeOptionDTO";
import { useAuth } from "@clerk/nextjs";
import { getChallengeOptions } from "@/app/services/admin/challenge-options";
import { toast } from "sonner";
interface ChallengeOptionsContextType {
  challengeOptions: ChallengeOptionDTO[];
  setChallengeOptions: (challengeOptions: ChallengeOptionDTO[]) => void;
  isChallengeOptionModalOpen: boolean;
  setIsChallengeOptionModalOpen: (isChallengeOptionModalOpen: boolean) => void;
  currentChallengeOption: ChallengeOptionDTO | null;
  setCurrentChallengeOption: (
    challengeOption: ChallengeOptionDTO | null
  ) => void;
  addChallengeOption: (challengeOption: ChallengeOptionDTOCreate) => void;
  updateChallengeOption: (challengeOption: ChallengeOptionDTO) => void;
  deleteChallengeOption: (challengeOption: ChallengeOptionDTO) => void;
}

const ChallengeOptionsContext = createContext<ChallengeOptionsContextType>({
  challengeOptions: [],
  setChallengeOptions: () => {},
  isChallengeOptionModalOpen: false,
  setIsChallengeOptionModalOpen: () => {},
  currentChallengeOption: null,
  setCurrentChallengeOption: () => {},
  addChallengeOption: () => {},
  updateChallengeOption: () => {},
  deleteChallengeOption: () => {},
});

const ChallengeOptionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getToken } = useAuth();
  const [challengeOptions, setChallengeOptions] = useState<
    ChallengeOptionDTO[]
  >([]);
  const [isChallengeOptionModalOpen, setIsChallengeOptionModalOpen] =
    useState(false);
  const [currentChallengeOption, setCurrentChallengeOption] =
    useState<ChallengeOptionDTO | null>(null);

  const addChallengeOption = (challengeOption: ChallengeOptionDTOCreate) => {
    setChallengeOptions([
      ...challengeOptions,
      challengeOption as ChallengeOptionDTO,
    ]);
  };

  useEffect(() => {
    const fetchChallengeOptions = async () => {
      try {
        const token = await getToken();
        if (!token) {
          return;
        }
        const challengeOptions = await getChallengeOptions(token);
        setChallengeOptions(challengeOptions);
      } catch (error) {
        toast.error("Error fetching challenge options");
      }
    };
    void fetchChallengeOptions();
  }, [getToken]);

  const updateChallengeOption = (challengeOption: ChallengeOptionDTO) => {
    setChallengeOptions(
      challengeOptions.map((option) =>
        option.id === challengeOption.id ? challengeOption : option
      )
    );
  };

  const deleteChallengeOption = (challengeOption: ChallengeOptionDTO) => {
    setChallengeOptions(
      challengeOptions.filter((option) => option.id !== challengeOption.id)
    );
  };

  return (
    <ChallengeOptionsContext.Provider
      value={{
        challengeOptions,
        setChallengeOptions,
        isChallengeOptionModalOpen,
        setIsChallengeOptionModalOpen,
        currentChallengeOption,
        setCurrentChallengeOption,
        addChallengeOption,
        updateChallengeOption,
        deleteChallengeOption,
      }}
    >
      {children}
    </ChallengeOptionsContext.Provider>
  );
};

export const useChallengeOptions = () => {
  return useContext(ChallengeOptionsContext);
};

export default ChallengeOptionsProvider;
