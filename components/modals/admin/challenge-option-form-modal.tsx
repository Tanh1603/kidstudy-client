/* eslint-disable import/order */
"use client";
import { SortableHeader } from "@/app/admin/column-helpers";
import UrlCell from "@/app/admin/url-cell";
import ChallengeOptionDTO, {
  ChallengeOptionForm,
  challengeOptionsSchema,
} from "@/app/models/ChallengeOptionDTO";
import { deleteFile, uploadFile } from "@/app/services/uploadFile";
import Loading from "@/components/loading";
import { TableComponent } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  useCreateChallengeOption,
  useDeleteChallengeOption,
  useGetChallengeOptionsByChallengeId,
  useUpdateChallengeOption,
} from "@/hooks/use-challenge-hook";
import { useAdminModal } from "@/store/use-admin-store";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const ChallengeOptionFormModal = () => {
  const { isOpen, data, type, onClose } = useAdminModal();
  const [selectedAudio, setSelectedAudio] = useState<File | null | undefined>(
    undefined
  );
  const [selectedImage, setSelectedImage] = useState<File | null | undefined>(
    undefined
  );
  const [currentOption, setCurrentOption] =
    useState<ChallengeOptionDTO | null>();

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const [created, setCreated] = useState(true);
  const { data: options = [], isLoading } = useGetChallengeOptionsByChallengeId(
    data as number
  );

  const [loading, setLoading] = useState(false);

  const create = useCreateChallengeOption(data as number);
  const update = useUpdateChallengeOption(data as number);
  const deleteFn = useDeleteChallengeOption(data as number);

  const handleDelete = async (option: ChallengeOptionDTO) => {
    const token = (await getToken()) as string;

    if (option.id) {
      const promises: Promise<unknown>[] = [];

      promises.push(deleteFn.mutateAsync(option.id));
      if (option.imageSrc) promises.push(deleteFile(option.imageSrc, token));

      if (option.audioSrc) promises.push(deleteFile(option.audioSrc, token));

      await Promise.all(promises);
      toast.success("Deleted option");
    }
  };

  const columns: ColumnDef<ChallengeOptionDTO>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => <SortableHeader column={column} title="id" />,
    },
    {
      accessorKey: "text",
      header: ({ column }) => <SortableHeader column={column} title="text" />,
    },
    {
      accessorKey: "correct",
      header: ({ column }) => (
        <SortableHeader column={column} title="correct" />
      ),
    },
    {
      accessorKey: "audioSrc",
      header: ({ column }) => (
        <SortableHeader column={column} title="audioSrc" />
      ),
      cell: ({ row }) => <UrlCell value={row.original.audioSrc ?? null} />,
    },
    {
      accessorKey: "imageSrc",
      header: ({ column }) => (
        <SortableHeader column={column} title="imageSrc" />
      ),
      cell: ({ row }) => <UrlCell value={row.original.imageSrc ?? null} />,
    },
    {
      accessorKey: "delete",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <Button
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                void handleDelete(row.original);
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const { getToken } = useAuth();
  const form = useForm<ChallengeOptionForm>({
    resolver: zodResolver(challengeOptionsSchema),
    defaultValues: currentOption
      ? currentOption
      : {
          challengeId: 0,
          text: "",
          correct: false,
        },
  });

  useEffect(() => {
    if (currentOption) {
      form.reset(currentOption);
      setCreated(false);
    } else {
      form.reset({
        challengeId: 0,
        text: "",
        correct: false,
      });
      setCreated(true);
    }
  }, [currentOption, form]);

  const onSubmit = async (values: ChallengeOptionForm) => {
    try {
      setLoading(true);
      const token = (await getToken()) as string;

      let imgSrc = currentOption?.imageSrc;
      let audioSrc = currentOption?.audioSrc;
      const promises: Promise<unknown>[] = [];

      if (!selectedAudio || !selectedImage) {
        toast.error("ImageSrc or AudioSrc not empty");
        return;
      }

      if (!created) {
        if (imgSrc) {
          promises.push(deleteFile(imgSrc, token));
          imgSrc = undefined;
        }
        if (audioSrc) {
          promises.push(deleteFile(audioSrc, token));
          audioSrc = undefined;
        }
      }

      promises.push(
        uploadFile(token, selectedImage).then((res) => {
          imgSrc = res;
          form.setValue("imageSrc", res);
        })
      );

      promises.push(
        uploadFile(token, selectedAudio).then((res) => {
          audioSrc = res;
          form.setValue("audioSrc", res);
        })
      );

      await Promise.all(promises);

      if (created) {
        await create.mutateAsync({
          ...values,
          challengeId: data as number,
          imageSrc: imgSrc,
          audioSrc: audioSrc || "",
        });
      } else {
        await update.mutateAsync({
          ...values,
          challengeId: data as number,
          imageSrc: imgSrc || "",
          audioSrc: audioSrc || "",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error");
    } finally {
      setLoading(false);
      setCurrentOption(null);
      setCreated(true);
      setSelectedImage(undefined);
      setSelectedAudio(undefined);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <Dialog
      open={isOpen && type === "challenge-options"}
      onOpenChange={() => {
        setCurrentOption(null);
        onClose();
      }}
    >
      <DialogContent
        className="min-h-[600px] max-w-[90vw] overflow-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="space-y-10">
          <DialogHeader className="block">
            <DialogTitle>
              <strong>Challenge Options</strong>
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="justify-between lg:flex">
            <div className="min-h-[400px] w-full rounded-sm border p-4 lg:w-[calc(33.333%-10px)]">
              <Form {...form}>
                <form
                  className="space-y-4"
                  onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
                >
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  ></FormField>

                  <FormField
                    control={form.control}
                    name="correct"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4">
                        <FormLabel className="mt-2">Correct</FormLabel>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="audioSrc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audio / Video</FormLabel>
                        <FormControl>
                          <div>
                            <Input
                              type="file"
                              accept="audio/*,video/*"
                              ref={audioInputRef}
                              onClick={(e) => {
                                e.currentTarget.value = "";
                                setSelectedAudio(null);
                              }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                setSelectedAudio(file || null);
                              }}
                            />

                            {field.value && (
                              <p className="max-w-[400px] break-words text-sm text-gray-500">
                                {field.value}
                              </p>
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl>
                          <div>
                            <Input
                              type="file"
                              accept="image/*"
                              ref={imageInputRef}
                              onClick={(e) => {
                                e.currentTarget.value = "";
                                setSelectedImage(null);
                              }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                setSelectedImage(file || null);
                              }}
                            />
                            {field.value && (
                              <p className="max-w-[400px] break-words text-sm text-gray-500">
                                {field.value}
                              </p>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="submit" variant="primary" className="w-32">
                      {loading ? <Loading /> : "Submit"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-32"
                      onClick={() => {
                        setCurrentOption(null);
                        setCreated(true);
                        setSelectedImage(undefined);
                        setSelectedAudio(undefined);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
            <div className="w-full rounded-sm border p-4 lg:w-2/3">
              <TableComponent
                data={options ?? []}
                columns={columns}
                addBtnStatus={false}
                onTableRowClick={(row: ChallengeOptionDTO) => {
                  setCurrentOption(row);
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeOptionFormModal;
