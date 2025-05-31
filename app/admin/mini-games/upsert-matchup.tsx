/* eslint-disable import/order */
"use client";
import {
  DifficultyEnum,
  GameTypeEnum,
  MatchUpGameQuestion,
  matchUpSchema,
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

const UpsertMatchUpQuestion = () => {
  const { onClose, isOpen, type, data, action } = useAdminModal();
  const currentMatchUp = data as MatchUpGameQuestion;

  const { data: topics, isLoading, isError } = useGetTopicAdmin();
  const [image, setImage] = useState<File | string | null>(null);
  const create = useCreateGameQuestion(GameTypeEnum.MATCH_UP);
  const update = useUpdateGameQuestion(GameTypeEnum.MATCH_UP);

  const form = useForm<MatchUpGameQuestion>({
    resolver: zodResolver(matchUpSchema),
    defaultValues: currentMatchUp
      ? currentMatchUp
      : {
          id: 0,
          topicId: 0,
          imageSrc: "",
          word: "",
          gameType: GameTypeEnum.MATCH_UP,
        },
  });

  useEffect(() => {
    if (currentMatchUp && action === "update") {
      setImage(currentMatchUp.imageSrc || null);
      form.reset(currentMatchUp);
    } else if (action === "create") {
      setImage(null);
      form.reset({
        id: 0,
        topicId: 0,
        imageSrc: "",
        word: "",
        gameType: GameTypeEnum.MATCH_UP,
      });
    }
  }, [currentMatchUp, action, form]);

  const onSubmit = async (values: MatchUpGameQuestion) => {
    if (action === "create") {
      const formData = new FormData();
      formData.append("topicId", values.topicId.toString());
      formData.append("difficulty", values.difficulty);
      formData.append("word", values.word);
      formData.append("imageSrc", image as File);
      formData.append("gameType", GameTypeEnum.MATCH_UP);

      await create.mutateAsync(formData);
      form.reset();
      setImage(null);
      onClose();
    } else if (action === "update") {
      const formData = new FormData();
      formData.append("id", values.id.toString());
      formData.append("topicId", values.topicId.toString());
      formData.append("difficulty", values.difficulty);
      formData.append("word", values.word);
      if (image as File) {
        formData.append("imageSrc", image as File);
      }
      formData.append("gameType", GameTypeEnum.MATCH_UP);

      await update.mutateAsync({ id: values.id, newQuestion: formData });
      form.reset();
      setImage(null);
      onClose();
    }
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
    <Dialog
      open={isOpen && type === "match-up"}
      onOpenChange={() => {
        onClose();
      }}
    >
      <DialogContent
        className="min-h-[50vh] max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <strong>
              {action == "create"
                ? "Create Match-Up question"
                : "Update Match-Up question"}
            </strong>
          </DialogTitle>
          <DialogDescription>
            {"Fill in the details to create a new Match-Up Question."}
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
                    <Input placeholder="Enter word" {...field} />
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
                        <Image
                          src={
                            typeof image === "string"
                              ? image
                              : URL.createObjectURL(image)
                          }
                          alt="Preview"
                          width={60}
                          height={60}
                          className="rounded border p-2"
                        />
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

export default UpsertMatchUpQuestion;
