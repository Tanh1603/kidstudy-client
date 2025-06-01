/* eslint-disable import/order */
"use client";
import {
  DifficultyEnum,
  GameTypeEnum,
  SpellingBeeGameQuestion,
  spellingBeeSchema,
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

const UpsertSpellingBeeQuestion = () => {
  const { onClose, isOpen, type, data, action } = useAdminModal();
  const currentSpellingBee = data as SpellingBeeGameQuestion;

  const { data: topics, isLoading, isError } = useGetTopicAdmin();
  const [image, setImage] = useState<File | string | null>(null);
  const [audio, setAudio] = useState<File | string | null>(null);
  const create = useCreateGameQuestion(GameTypeEnum.SPELLING_BEE);
  const update = useUpdateGameQuestion(GameTypeEnum.SPELLING_BEE);

  const form = useForm<SpellingBeeGameQuestion>({
    resolver: zodResolver(spellingBeeSchema),
    defaultValues: currentSpellingBee
      ? currentSpellingBee
      : {
          id: 0,
          topicId: 0,
          difficulty: DifficultyEnum.EASY,
          imageSrc: "",
          word: "",
          gameType: GameTypeEnum.SPELLING_BEE,
        },
  });

  useEffect(() => {
    if (currentSpellingBee && action === "update") {
      setImage(currentSpellingBee.imageSrc || null);
      setAudio(currentSpellingBee.audioSrc || null);
      form.reset(currentSpellingBee);
    } else if (action === "create") {
      setImage(null);
      form.reset({
        id: 0,
        topicId: 0,
        imageSrc: "",
        word: "",
        gameType: GameTypeEnum.SPELLING_BEE,
      });
    }
  }, [currentSpellingBee, action, form]);

  const onSubmit = async (values: SpellingBeeGameQuestion) => {
    if (action === "create") {
      const formData = new FormData();
      formData.append("topicId", values.topicId.toString());
      formData.append("difficulty", values.difficulty);
      formData.append("word", values.word);
      if (image as File) {
        formData.append("imageSrc", image as File);
      }
      if (audio instanceof File) {
        formData.append("audioSrc", audio);
      }
      formData.append("gameType", GameTypeEnum.SPELLING_BEE);

      await create.mutateAsync(formData);
      resetForm();
    } else if (action === "update") {
      const formData = new FormData();
      formData.append("id", values.id.toString());
      formData.append("topicId", values.topicId.toString());
      formData.append("difficulty", values.difficulty);
      formData.append("word", values.word);
      if (image as File) {
        formData.append("imageSrc", image as File);
      }
      if (audio instanceof File) {
        formData.append("audioSrc", audio);
      }
      formData.append("gameType", GameTypeEnum.SPELLING_BEE);
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
    <Dialog open={isOpen && type === "spelling-bee"} onOpenChange={resetForm}>
      <DialogContent
        className="min-h-[50vh] max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <strong>
              {action == "create"
                ? "Create Spelling-bee question"
                : "Update Spelling-bee question"}
            </strong>
          </DialogTitle>
          <DialogDescription>
            {"Fill in the details to create a new Spelling-bee Question."}
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
                  <FormLabel>Select topic</FormLabel>
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
                  <FormLabel>Select difficulty</FormLabel>
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

            <FormField
              control={form.control}
              name="word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Word</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Word" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

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

                        // {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

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
                        accept="audio/* video/*"
                        placeholder="Enter image URL"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAudio(file);
                            field.onChange(URL.createObjectURL(file));
                          }
                        }}

                        // {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

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

export default UpsertSpellingBeeQuestion;
