/* eslint-disable import/order */
"use client";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAdminModal } from "@/store/use-admin-store";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Loading from "@/components/loading";
import { useGetLesson } from "@/hooks/use-lesson-hook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ChallengeDTO, {
  ChallengeForm,
  challengeSchema,
  challengeType,
} from "@/app/models/ChallengeDTO";
import {
  useCreateChallenge,
  useUpdateChallenge,
} from "@/hooks/use-challenge-hook";
import { useAuth } from "@clerk/nextjs";
import { deleteFile, uploadFile } from "@/app/services/uploadFile";
import Image from "next/image";

export const ChallengeFormModal = () => {
  const { isOpen, onClose, action, data, type } = useAdminModal();
  const { data: lessons = [] } = useGetLesson();
  const create = useCreateChallenge();
  const update = useUpdateChallenge();
  const { getToken } = useAuth();

  const currentChallenge = data as ChallengeDTO;

  const [selectedAudio, setSelectedAudio] = useState<File | null>();
  const [audioURL, setAudioURL] = useState<string | null>();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);

  const form = useForm<ChallengeForm>({
    resolver: zodResolver(challengeSchema),
    defaultValues: data
      ? (data as ChallengeForm)
      : {
          question: "",
          audioSrc: "",
          lessonId: 0,
          type: "SELECT",
          order: 1,
        },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      form.reset(
        data
          ? (data as ChallengeForm)
          : {
              question: "",
              audioSrc: "",
              lessonId: 0,
              type: "SELECT",
              order: 1,
            }
      );
    }
  }, [isOpen, data, form]);

  useEffect(() => {
    if (selectedAudio) {
      const objectUrl = URL.createObjectURL(selectedAudio);
      setAudioURL(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setAudioURL(null);
    }
  }, [selectedAudio]);

  useEffect(() => {
    if (selectedImage) {
      const objectUrl = URL.createObjectURL(selectedImage);
      setImageURL(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setImageURL(null);
    }
  }, [selectedImage]);

  useEffect(() => {
    if (currentChallenge && action === "update") {
      setAudioURL(currentChallenge.audioSrc || null);
      setImageURL(currentChallenge.imageSrc || null);
    }
  }, [action, currentChallenge]);

  const onSubmit = async (values: ChallengeForm) => {
    try {
      setLoading(true);
      const token = (await getToken()) as string;

      let audioSrc = currentChallenge?.audioSrc;
      let imageSrc = currentChallenge?.imageSrc;

      const promises: Promise<unknown>[] = [];

      if (action === "update") {
        if (audioSrc) {
          promises.push(deleteFile(audioSrc, token));
          audioSrc = null;
        }
        if (imageSrc) {
          promises.push(deleteFile(imageSrc, token));
          imageSrc = null;
        }
      }

      if (selectedAudio) {
        const audioPromise = uploadFile(token, selectedAudio).then((res) => {
          audioSrc = res;
        });
        promises.push(audioPromise);
      }

      if (selectedImage) {
        const imagePromise = uploadFile(token, selectedImage).then((res) => {
          imageSrc = res;
        });
        promises.push(imagePromise);
      }

      await Promise.all(promises);

      if (action === "create") {
        await create.mutateAsync({
          ...values,
          audioSrc,
          imageSrc,
        });
      } else {
        await update.mutateAsync({
          ...values,
          audioSrc,
          imageSrc,
        });
      }

      onClose();
      setSelectedAudio(null);
      setSelectedImage(null);
      setImageURL(null);
      setAudioURL(null);
    } catch (error) {
      console.error(error);
      toast.error("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen && type === "challenge"}
      onOpenChange={() => {
        onClose();
        setSelectedAudio(null);
        setSelectedImage(null);
        setImageURL(null);
        setAudioURL(null);
      }}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-h-screen overflow-auto"
      >
        <DialogHeader>
          <DialogTitle>
            <strong>
              {action === "create" ? "Create Challenge" : "Update Challenge"}
            </strong>
          </DialogTitle>
          <DialogDescription>
            {action === "create"
              ? "Fill in the details to create a new challenge."
              : "Modify the details of the selected challenge."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="space-y-2"
          >
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={form.control}
              name="lessonId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson</FormLabel>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lesson" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lessons.map((lesson) =>
                        lesson.id !== undefined &&
                        lesson.id != 0 &&
                        lesson.title ? (
                          <SelectItem
                            key={lesson.id}
                            value={lesson.id.toString()}
                          >
                            {lesson.title}
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenge type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select challenge type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {challengeType.map((t) => (
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
              name="audioSrc"
              render={() => (
                <FormItem>
                  <FormLabel>Audio / Video</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-center gap-4">
                      <Input
                        type="file"
                        accept="audio/*,video/*"
                        onClick={(e) => {
                          e.currentTarget.value = "";
                          setSelectedAudio(null);
                          setAudioURL(null);
                        }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setSelectedAudio(file || null);
                          if (!file || e.target.files?.length === 0) {
                            setAudioURL(null);
                          }
                        }}
                      />
                      {audioURL && (
                        <audio controls src={audioURL}>
                          Your browser does not support the audio element.
                        </audio>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageSrc"
              render={() => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onClick={(e) => {
                          e.currentTarget.value = "";
                          setSelectedImage(null);
                          setImageURL(null);
                        }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setSelectedImage(file || null);
                          if (!file || e.target.files?.length === 0) {
                            setImageURL(null);
                          }
                        }}
                      />
                      {imageURL && (
                        <div className="relative h-[60px] w-[60px]">
                          <Image
                            src={imageURL}
                            fill
                            objectFit="contain"
                            alt="image"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <div className="flex justify-end">
              <Button type="submit" variant="primary" className="w-32">
                {loading ? <Loading /> : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
