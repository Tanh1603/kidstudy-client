/* eslint-disable import/order */
"use client";
import TopicDTO from "@/app/models/TopicDTO";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useUpdateTopicIcon,
  useUpdateTopicTitle,
} from "@/hooks/use-topic-hook";
import Image from "next/image";
import { useState } from "react";

type UpdateTopicModalProps = {
  topic?: TopicDTO;
  onClose: () => void;
};

const UpdateTopicModal = ({ topic, onClose }: UpdateTopicModalProps) => {
  const [title, setTitle] = useState<string>(topic?.title ?? "");
  const [icon, setIcon] = useState<File | null>(null);
  const updateTopicTitle = useUpdateTopicTitle();
  const updateTopicIcon = useUpdateTopicIcon();

  if (!topic) {
    return (
      <div className="modal">
        <p className="text-red-500">No topic selected</p>
      </div>
    );
  }

  const handleUpdateTitle = async () => {
    if (title === topic.title) return;
    await updateTopicTitle.mutateAsync({ id: topic.id, title });
    onClose();
  };

  const handleUpdateIcon = async () => {
    if (!icon) return;
    await updateTopicIcon.mutateAsync({ id: topic.id, icon });
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Title Update */}
      <div className="grid gap-4">
        <Label htmlFor="title">Title</Label>
        <div className="flex items-center gap-4">
          <Input
            type="text"
            id="title"
            value={title}
            className="flex-1 rounded border px-2 py-1"
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button variant="super" onClick={void handleUpdateTitle}>
            {updateTopicTitle.isPending ? <Loading /> : "Update Title"}
          </Button>
        </div>
      </div>

      {/* Preview Icon */}
      <div className="grid gap-4">
        <Label htmlFor="icon">Icon</Label>
        <div className="flex items-center gap-4">
          <Image
            src={icon ? URL.createObjectURL(icon) : topic.icon}
            alt="Current icon"
            width={60}
            height={60}
            className="rounded border p-2"
          />
          <Input
            type="file"
            id="icon"
            accept="image/*"
            onChange={(e) => setIcon(e.target.files?.[0] || null)}
          />
          <Button variant="super" onClick={void handleUpdateIcon}>
            {updateTopicIcon.isPending ? <Loading /> : "Update Icon"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpdateTopicModal;
