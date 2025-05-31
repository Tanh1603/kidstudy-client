/* eslint-disable import/order */
"use client";
import {
  DifficultyEnum,
  GameTypeEnum,
  MemoryEnum,
  MemoryGameQuestion,
  MemoryGameQuestionWithAudio,
  MemoryGameQuestionWithImage,
  MemoryGameQuestionWithImageAndAudio,
  memoryGameSchema,
} from "@/app/models/Game";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateGameQuestion,
  useUpdateGameQuestion,
} from "@/hooks/use-game-question-hook";
import { useGetTopicAdmin } from "@/hooks/use-topic-hook";
import { useAdminModal } from "@/store/use-admin-store";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const UpsertMemoryQuestion = () => {
  const { onClose, isOpen, type, data, action } = useAdminModal();
  const currentMemory = data as MemoryGameQuestion;

  const { data: topics, isLoading, isError } = useGetTopicAdmin();
  const [image, setImage] = useState<File | string | null>(null);
  const [audio, setAudio] = useState<File | string | null>(null);
  const create = useCreateGameQuestion(GameTypeEnum.MEMORY);
  const update = useUpdateGameQuestion(GameTypeEnum.MEMORY);

  const form = useForm<MemoryGameQuestion>({
    resolver: zodResolver(memoryGameSchema),
    defaultValues: currentMemory
      ? currentMemory
      : {
          id: 0,
          topicId: 0,
          imageSrc: "",
          word: "",
          gameType: GameTypeEnum.MEMORY,
        },
  });

  useEffect(() => {
    if (currentMemory && action === "update") {
      if (
        (currentMemory as MemoryGameQuestionWithImage) ||
        (currentMemory as MemoryGameQuestionWithImageAndAudio)
      ) {
        setImage(
          (
            (currentMemory as MemoryGameQuestionWithImage) ||
            (currentMemory as MemoryGameQuestionWithImageAndAudio)
          ).imageSrc || null
        );
      }
      if (
        (currentMemory as MemoryGameQuestionWithAudio) ||
        (currentMemory as MemoryGameQuestionWithImageAndAudio)
      ) {
        setAudio(
          (
            (currentMemory as MemoryGameQuestionWithAudio) ||
            (currentMemory as MemoryGameQuestionWithImageAndAudio)
          ).audioSrc || null
        );
      }
    }
  }, [currentMemory]);

  const selectedMemoryType = form.watch("memoryType");

  const onSubmit = async (values: MemoryGameQuestion) => {
    if (action === "create") {
      const formData = new FormData();
      if (values.memoryType === MemoryEnum.WORD_WORD) {
        formData.append("matchText", values.matchText);
        formData.append("word", values.word);
      } else if (values.memoryType === MemoryEnum.WORD_IMAGE) {
        formData.append("word", values.word);
        formData.append("imageSrc", image as string);
      } else if (values.memoryType === MemoryEnum.WORD_AUDIO) {
        formData.append("word", values.word);
        formData.append("audioSrc", audio as string);
      } else if (values.memoryType === MemoryEnum.IMAGE_AUDIO) {
        formData.append("imageSrc", image as string);
        formData.append("audioSrc", audio as string);
      }
      formData.append("topicId", values.topicId.toString());
      formData.append("difficulty", values.difficulty);
      formData.append("memoryType", values.memoryType);
      formData.append("gameType", GameTypeEnum.MEMORY);
      await create.mutateAsync(formData);

      resetForm();
    } else if (action === "update") {
      const formData = new FormData();
      if (values.memoryType === MemoryEnum.WORD_WORD) {
        formData.append("matchText", values.matchText);
        formData.append("word", values.word);
      } else if (values.memoryType === MemoryEnum.WORD_IMAGE) {
        formData.append("word", values.word);
        formData.append("imageSrc", image as string);
      } else if (values.memoryType === MemoryEnum.WORD_AUDIO) {
        formData.append("word", values.word);
        formData.append("audioSrc", audio as string);
      } else if (values.memoryType === MemoryEnum.IMAGE_AUDIO) {
        formData.append("imageSrc", image as string);
        formData.append("audioSrc", audio as string);
      }
      formData.append("topicId", values.topicId.toString());
      formData.append("difficulty", values.difficulty);
      formData.append("memoryType", values.memoryType);
      formData.append("gameType", GameTypeEnum.MEMORY);
      await update.mutateAsync({ id: values.id, newQuestion: formData });
      resetForm();
    }
  };

  const resetForm = () => {
    form.reset();
    setImage(null);
    setAudio(null);
    onClose();
  };

  if (isLoading) {
    return;
  }
  if (isError) {
    return <div>Error loading topic</div>;
  }

  if (!topics || topics.length === 0) {
    return <div>No topics available</div>;
  }

  return (
    <Dialog open={isOpen && type === "memory"} onOpenChange={resetForm}>
      <DialogContent
        className="min-h-[50vh] max-w-xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <strong>
              {action == "create"
                ? "Create Memory question"
                : "Update Memory question"}
            </strong>
          </DialogTitle>
          <DialogDescription>
            {"Fill in the details to create a new Memory Question."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="space-y-2"
          >
            <FormField
              control={form.control}
              name="topicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <Select
                    value={
                      field.value && field.value !== 0
                        ? field.value.toString()
                        : undefined
                    }
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {topics.map((topic) =>
                        topic.id !== undefined &&
                        topic.id != 0 &&
                        topic.title ? (
                          <SelectItem
                            key={topic.id}
                            value={topic.id.toString()}
                          >
                            {topic.title}
                          </SelectItem>
                        ) : null
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(DifficultyEnum).map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            {action === "create" && (
              <FormField
                control={form.control}
                name="memoryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Memory type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(MemoryEnum).map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
            )}

            {(selectedMemoryType === MemoryEnum.WORD_IMAGE ||
              selectedMemoryType === MemoryEnum.WORD_AUDIO ||
              selectedMemoryType === MemoryEnum.WORD_WORD) && (
              <FormField
                control={form.control}
                name="word"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Word</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter word" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
            )}

            {selectedMemoryType === MemoryEnum.WORD_WORD && (
              <FormField
                control={form.control}
                name="matchText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match text</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Match text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
            )}

            {(selectedMemoryType === MemoryEnum.WORD_IMAGE ||
              selectedMemoryType === MemoryEnum.IMAGE_AUDIO) && (
              <FormField
                control={form.control}
                name="imageSrc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Image</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        {image && (
                          <div className="h-16 w-16">
                            <Image
                              src={
                                typeof image === "string"
                                  ? image
                                  : URL.createObjectURL(image)
                              }
                              alt="Preview"
                              width={60}
                              height={60}
                              className="rounded border object-fill p-2"
                            />
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          placeholder="Enter image URL"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImage(file);
                              field.onChange(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
            )}

            {(selectedMemoryType === MemoryEnum.IMAGE_AUDIO ||
              selectedMemoryType === MemoryEnum.WORD_AUDIO) && (
              <FormField
                control={form.control}
                name="audioSrc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Audio</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        {audio && (
                          <div className="w-full">
                            <audio
                              controls
                              src={
                                typeof audio === "string"
                                  ? audio
                                  : URL.createObjectURL(audio)
                              }
                              className="max-w-full"
                            />
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="audio/*"
                          placeholder="Select Audio"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setAudio(file);
                              field.onChange(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
            )}

            <div className="flex justify-end">
              <Button type="submit" variant="primary" className="w-32">
                {create.isPending || update.isPending ? <Loading /> : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertMemoryQuestion;
