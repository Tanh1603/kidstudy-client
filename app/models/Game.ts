enum GameTypeEnum {
  ANAGRAM = "ANAGRAM",
  MATCH_UP = "MATCH_UP",
  MEMORY = "MEMORY",
  SPELLING_BEE = "SPELLING_BEE",
}

enum MemoryEnum {
  WORD_IMAGE = "WORD_IMAGE",
  WORD_AUDIO = "WORD_AUDIO",
  IMAGE_AUDIO = "IMAGE_AUDIO",
  WORD_WORD = "WORD_WORD",
}

enum DifficultyEnum {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

type BaseGameQuestion = {
  id: number;
  difficulty: DifficultyEnum;
  topicId: number;
};

type AnagramGameQuestion = BaseGameQuestion & {
  gameType: "ANAGRAM";
  word: string;
  imageSrc: string;
};

type MatchUpGameQuestion = BaseGameQuestion & {
  gameType: "MATCH_UP";
  word: string;
  imageSrc: string;
};

type SpellingBeeGameQuestion = BaseGameQuestion & {
  gameType: "SPELLING_BEE";
  word: string;
  imageSrc: string;
  audioSrc: string;
};

// memory game questions can have different types of content
type MemoryGameQuestionWithImage = BaseGameQuestion & {
  gameType: "MEMORY";
  memoryType: "WORD_IMAGE";
  word: string;
  imageSrc: string;
};

type MemoryGameQuestionWithAudio = BaseGameQuestion & {
  gameType: "MEMORY";
  memoryType: "WORD_AUDIO";
  word: string;
  audioSrc: string;
};

type MemoryGameQuestionWithWord = BaseGameQuestion & {
  gameType: "MEMORY";
  memoryType: "WORD_WORD";
  word: string;
  matchText: string;
};

type MemoryGameQuestionWithImageAndAudio = BaseGameQuestion & {
  gameType: "MEMORY";
  memoryType: "IMAGE_AUDIO";
  imageSrc: string;
  audioSrc: string;
};

type MemoryGameQuestion =
  | MemoryGameQuestionWithImage
  | MemoryGameQuestionWithAudio
  | MemoryGameQuestionWithWord
  | MemoryGameQuestionWithImageAndAudio;

type GameQuestion =
  | AnagramGameQuestion
  | MatchUpGameQuestion
  | SpellingBeeGameQuestion
  | MemoryGameQuestion;

export type {
  AnagramGameQuestion,
  MatchUpGameQuestion,
  SpellingBeeGameQuestion,
  MemoryGameQuestionWithWord,
  MemoryGameQuestionWithImage,
  MemoryGameQuestionWithAudio,
  MemoryGameQuestionWithImageAndAudio,
  MemoryGameQuestion,
  GameQuestion,
};

export { GameTypeEnum, MemoryEnum, DifficultyEnum };
