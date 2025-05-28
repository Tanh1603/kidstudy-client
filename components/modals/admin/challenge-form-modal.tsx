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
import {
  ChallengeForm,
  challengeSchema,
  challengeType,
} from "@/app/models/ChallengeDTO";
import {
  useCreateChallenge,
  useUpdateChallenge,
} from "@/hooks/use-challenge-hook";

export const ChallengeFormModal = () => {
  const { isOpen, onClose, action, data, type } = useAdminModal();
  const { data: lessons = [] } = useGetLesson();
  const create = useCreateChallenge();
  const update = useUpdateChallenge();

  const form = useForm<ChallengeForm>({
    resolver: zodResolver(challengeSchema),
    defaultValues: data
      ? (data as ChallengeForm)
      : {
          question: "",
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
              lessonId: 0,
              type: "SELECT",
              order: 1,
            }
      );
    }
  }, [isOpen, data, form]);

  const onSubmit = async (values: ChallengeForm) => {
    try {
      setLoading(true);
      if (action === "create") {
        await create.mutateAsync({
          ...values,
        });
      } else {
        await update.mutateAsync({
          ...values,
        });
      }

      onClose();
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
