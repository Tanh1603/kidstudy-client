/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { LessonForm, lessonSchema } from "@/app/models/Lesson";
import { useCreateLesson, useUpdateLesson } from "@/hooks/use-lesson-hook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUnit } from "@/hooks/use-unit-hook";

export const LessonFormModal = () => {
  const { isOpen, onClose, action, data, type } = useAdminModal();
  const { data: units = [] } = useUnit();
  const create = useCreateLesson();
  const update = useUpdateLesson();
  const form = useForm<LessonForm>({
    resolver: zodResolver(lessonSchema),
    defaultValues: data
      ? (data as LessonForm)
      : {
          title: "",
          unitId: 0,
          order: 1,
        },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      form.reset(
        data
          ? (data as LessonForm)
          : {
              title: "",
              unitId: 0,
              order: 1,
            }
      );
    }
  }, [isOpen, data, form]);

  const onSubmit = async (values: LessonForm) => {
    try {
      console.log(values);
      setLoading(true);
      if (action == "create") {
        await create.mutateAsync(values);
      } else {
        await update.mutateAsync(values);
      }
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen && type === "lesson"} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <strong>
              {action === "create" ? "Create Lesson" : "Update Lesson"}
            </strong>
          </DialogTitle>
          <DialogDescription>
            {action === "create"
              ? "Fill in the details to create a new lesson."
              : "Modify the details of the selected lesson."}{" "}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units.map((unit) =>
                        unit.id !== undefined && unit.id != 0 && unit.title ? (
                          <SelectItem key={unit.id} value={unit.id.toString()}>
                            {unit.title}
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
