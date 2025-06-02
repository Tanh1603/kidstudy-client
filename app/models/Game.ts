import { number, z } from "zod";

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

// type BaseGameQuestion = {
//   id: number;
//   difficulty: DifficultyEnum;
//   topicId: number;
// };
const fileOrUrl = z.union([z.string().url(), z.instanceof(File)]);

const baseGameSchema = z.object({
  id: number(),
  topicId: z.number().min(1, "Topic ID is required"),
  difficulty: z.nativeEnum(DifficultyEnum),
});

const anagramSchema = baseGameSchema.extend({
  gameType: z.literal(GameTypeEnum.ANAGRAM),
  word: z.string().min(1, "Word is required"),
  imageSrc: fileOrUrl,
  audioSrc: fileOrUrl,
});

const matchUpSchema = baseGameSchema.extend({
  gameType: z.literal(GameTypeEnum.MATCH_UP),
  word: z.string().min(1, "Word is required"),
  imageSrc: fileOrUrl,
  audioSrc: fileOrUrl,
});

const spellingBeeSchema = baseGameSchema.extend({
  gameType: z.literal(GameTypeEnum.SPELLING_BEE),
  word: z.string().min(1, "Word is required"),
  imageSrc: fileOrUrl,
  audioSrc: fileOrUrl,
});

const memoryWordImageSchema = baseGameSchema.extend({
  gameType: z.literal(GameTypeEnum.MEMORY),
  memoryType: z.literal(MemoryEnum.WORD_IMAGE),
  word: z.string().min(1),
  imageSrc: fileOrUrl,
});

const memoryWordAudioSchema = baseGameSchema.extend({
  gameType: z.literal(GameTypeEnum.MEMORY),
  memoryType: z.literal(MemoryEnum.WORD_AUDIO),
  word: z.string().min(1),
  audioSrc: fileOrUrl,
});

const memoryWordWordSchema = baseGameSchema.extend({
  gameType: z.literal(GameTypeEnum.MEMORY),
  memoryType: z.literal(MemoryEnum.WORD_WORD),
  word: z.string().min(1, "Word is required"),
  matchText: z.string().min(1, "Match text is required"),
});

const memoryImageAudioSchema = baseGameSchema.extend({
  gameType: z.literal(GameTypeEnum.MEMORY),
  memoryType: z.literal(MemoryEnum.IMAGE_AUDIO),
  imageSrc: fileOrUrl,
  audioSrc: fileOrUrl,
});

const memoryGameSchema = z.discriminatedUnion("memoryType", [
  memoryWordImageSchema,
  memoryWordAudioSchema,
  memoryWordWordSchema,
  memoryImageAudioSchema,
]);

const gameQuestionSchema = z.union([
  anagramSchema,
  matchUpSchema,
  spellingBeeSchema,
  memoryGameSchema,
]);

export type GameQuestionForm = z.infer<typeof gameQuestionSchema>;

// type AnagramGameQuestion = BaseGameQuestion & {
//   gameType: "ANAGRAM";
//   word: string;
//   imageSrc: string;
// };

type AnagramGameQuestion = z.infer<typeof anagramSchema>;

// type MatchUpGameQuestion = BaseGameQuestion & {
//   gameType: "MATCH_UP";
//   word: string;
//   imageSrc: string;
// };

type MatchUpGameQuestion = z.infer<typeof matchUpSchema>;

// type SpellingBeeGameQuestion = BaseGameQuestion & {
//   gameType: "SPELLING_BEE";
//   word: string;
//   imageSrc: string;
//   audioSrc: string;
// };

type SpellingBeeGameQuestion = z.infer<typeof spellingBeeSchema>;

// memory game questions can have different types of content
// type MemoryGameQuestionWithImage = BaseGameQuestion & {
//   gameType: "MEMORY";
//   memoryType: "WORD_IMAGE";
//   word: string;
//   imageSrc: string;
// };

type MemoryGameQuestionWithImage = z.infer<typeof memoryWordImageSchema>;

// type MemoryGameQuestionWithAudio = BaseGameQuestion & {
//   gameType: "MEMORY";
//   memoryType: "WORD_AUDIO";
//   word: string;
//   audioSrc: string;
// };

type MemoryGameQuestionWithAudio = z.infer<typeof memoryWordAudioSchema>;

// type MemoryGameQuestionWithWord = BaseGameQuestion & {
//   gameType: "MEMORY";
//   memoryType: "WORD_WORD";
//   word: string;
//   matchText: string;
// };

type MemoryGameQuestionWithWord = z.infer<typeof memoryWordWordSchema>;

// type MemoryGameQuestionWithImageAndAudio = BaseGameQuestion & {
//   gameType: "MEMORY";
//   memoryType: "IMAGE_AUDIO";
//   imageSrc: string;
//   audioSrc: string;
// };

type MemoryGameQuestionWithImageAndAudio = z.infer<
  typeof memoryImageAudioSchema
>;

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
export {
  gameQuestionSchema,
  memoryGameSchema,
  anagramSchema,
  matchUpSchema,
  spellingBeeSchema,
  memoryWordImageSchema,
  memoryWordAudioSchema,
  memoryWordWordSchema,
  memoryImageAudioSchema,
};
