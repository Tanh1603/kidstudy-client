/* eslint-disable import/order */
"use client";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useDeleteTopic, useGetTopicAdmin } from "@/hooks/use-topic-hook";
import Image from "next/image";
import React, { useState } from "react";
import AddTopicModal from "./add";
import UpdateTopicModal from "./update";
import TopicDTO from "@/app/models/TopicDTO";
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChallengeDTO from "@/app/models/ChallengeDTO";
import { MoreHorizontal } from "lucide-react";
import { type } from "os";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TopicPage = () => {
  const { data, isLoading, isError } = useGetTopicAdmin();
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editTopic, setEditTopic] = useState<TopicDTO>();

  const deleteTopic = useDeleteTopic();

  if (isLoading || deleteTopic.isPending) return <Loading />;
  if (isError)
    return (
      <div className="mt-10 text-center text-red-500">
        Error loading mini games
      </div>
    );

  return (
    <div className="px-4">
      <div>
        <div className="flex justify-end pb-4">
          <Button
            variant="secondary"
            className="w-[80px]"
            onClick={() => setOpenAdd(true)}
          >
            Add
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data?.map((topic) => (
            <div
              key={topic.id}
              className="flex cursor-pointer flex-col items-center rounded-2xl bg-gray-700 p-5 text-center shadow-md transition-shadow hover:shadow-xl"
            >
              <Image
                src={topic.icon}
                alt={topic.title}
                width={50}
                height={50}
                className="mb-4 object-contain"
              />
              <div className="flex justify-between">
                <h2 className="mb-2 w-full truncate text-lg font-semibold text-gray-700">
                  {topic.title}
                </h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-8 w-[80px]">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="m-0 p-0">
                    <DropdownMenuItem
                      className="cursor-pointer active:bg-blue-500"
                      onClick={() => {
                        setEditTopic(topic);
                        setOpenEdit(true);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer active:bg-red-500"
                      onClick={() => deleteTopic.mutate(topic.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={openAdd || openEdit}
        onOpenChange={() => {
          setOpenAdd(false);
          setOpenEdit(false);
          setEditTopic(undefined);
        }}
      >
        <DialogContent
          className="min-h-[50vh] max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              <strong>
                {openAdd && "Create topic"}
                {openEdit && "Update topic"}
              </strong>
            </DialogTitle>
            <DialogDescription>
              {"Fill in the details to create a new topic."}
            </DialogDescription>
          </DialogHeader>
          {openAdd && <AddTopicModal onClose={() => setOpenAdd(false)} />}
          {openEdit && (
            <UpdateTopicModal
              topic={editTopic}
              onClose={() => setOpenEdit(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopicPage;
