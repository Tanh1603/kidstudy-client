/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/order */
"use client";
import { UnitForm, unitSchema } from "@/app/models/UnitDTO";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateUnit, useUpdateUnit } from "@/hooks/use-unit-hook";
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

export const UnitFormModal = () => {
  const { isOpen, onClose, action, data, type } = useAdminModal();
  const create = useCreateUnit();
  const update = useUpdateUnit();
  const form = useForm<UnitForm>({
    resolver: zodResolver(unitSchema),
    defaultValues: data
      ? (data as UnitForm)
      : {
          description: "",
          title: "",
          order: 1,
        },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      form.reset(
        data
          ? (data as UnitForm)
          : {
              title: "",
              description: "",
              order: 1,
            }
      );
    }
  }, [isOpen, data, form]);

  const onSubmit = async (values: UnitForm) => {
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
    <Dialog open={isOpen && type === "unit"} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <strong>
              {action === "create" ? "Create Unit" : "Update Unit"}
            </strong>
          </DialogTitle>
          <DialogDescription>
            {action === "create"
              ? "Fill in the details to create a new unit."
              : "Modify the details of the selected unit."}{" "}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
