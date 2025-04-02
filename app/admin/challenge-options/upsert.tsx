/* eslint-disable import/order */
"use client";
import ChallengeOptionDTO, {
  ChallengeOptionDTOCreate,
} from "@/app/models/ChallengeOptionDTO";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChallengeOptions } from "./context";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChallenges } from "../challenges/context";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";

const emptyImageSrc = "/empty.jpg";

const UpsertChallengeOptionModal = ({
  isOpen,
  onCloseModal,
}: {
  isOpen: boolean;
  onCloseModal: () => void;
}): React.ReactElement => {
  const [imageSrc, setImageSrc] = useState<string>(emptyImageSrc);
  const [audioSrc, setAudioSrc] = useState<string>("");
  const { addChallengeOption, currentChallengeOption } = useChallengeOptions();
  const { challenges } = useChallenges();
  const [challengeOption, setChallengeOption] =
    useState<ChallengeOptionDTOCreate>({
      challengeId: 0,
      text: "",
      correct: false,
      imageSrc: "",
      audioSrc: "",
    });

  useEffect(() => {
    if (currentChallengeOption) {
      setChallengeOption(currentChallengeOption);
      setImageSrc(currentChallengeOption.imageSrc ?? emptyImageSrc);
    }
  }, [currentChallengeOption]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChallengeOption((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    addChallengeOption({
      ...challengeOption,
      audioSrc: audioSrc,
      imageSrc: imageSrc,
    });

    onCloseModal();
    setChallengeOption({
      challengeId: 0,
      text: "",
      correct: false,
      imageSrc: "",
      audioSrc: "",
    });
  };

  const handleChangeLesson = (value: string) => {
    setChallengeOption((prevState) => ({
      ...prevState,
      challengeId: parseInt(value),
    }));
  };

  const handleCheckboxChange = (value: boolean) => {
    setChallengeOption((prevState) => ({
      ...prevState,
      correct: value,
    }));
  };

  const onChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageSrc(URL.createObjectURL(file));
    }
  };

  const onChangeAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioSrc(URL.createObjectURL(file));
    }
  };
  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-[800px] rounded-md bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">
          {currentChallengeOption
            ? "Edit Challenge Option"
            : "Add New Challenge Option"}
        </h2>
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="challengeId"
              className="block text-sm font-medium text-gray-700"
            >
              Challenge
            </Label>
            <Select
              value={challengeOption.challengeId.toString()}
              onValueChange={handleChangeLesson}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a Challenge" />
              </SelectTrigger>
              <SelectContent>
                {challenges.map((challenge) => (
                  <SelectItem
                    key={challenge.id}
                    value={challenge.id.toString()}
                  >
                    {challenge.question} - {challenge.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label
              htmlFor="text"
              className="block text-sm font-medium text-gray-700"
            >
              Text
            </Label>
            <Input
              id="text"
              name="text"
              type="text"
              value={challengeOption.text}
              onChange={handleChange}
              className="mt-2 w-full border p-2"
              placeholder="Enter text"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor="audioSrc"
              className="block text-sm font-medium text-gray-700"
            >
              Audio Source
            </Label>
            <audio controls>
              <source src={challengeOption.audioSrc} type="audio/mpeg" />
            </audio>
            <Input
              className="w-fit"
              id="audioSrc"
              name="audioSrc"
              type="file"
              onChange={onChangeAudio}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor="imageSrc"
              className="block text-sm font-medium text-gray-700"
            >
              Image
            </Label>
            <div className="mt-2 border p-2">
              <Image
                src={imageSrc}
                alt="Challenge Option Image"
                width={200}
                height={200}
                className="aspect-video object-fill"
                onError={() => setImageSrc(emptyImageSrc)}
              />
            </div>
            <Input
              className="w-fit"
              id="imageSrc"
              name="imageSrc"
              type="file"
              onChange={onChangeImage}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="audioSrc"
              className="block text-sm font-medium text-gray-700"
            >
              Audio Source
            </Label>
            <Input
              id="audioSrc"
              name="audioSrc"
              type="text"
              value={challengeOption.audioSrc}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Correct
            </Label>
            <Checkbox
              id="correct"
              name="correct"
              checked={challengeOption.correct}
              onCheckedChange={() =>
                handleCheckboxChange(!challengeOption.correct)
              }
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="danger"
            className="mr-2"
            onClick={() => {
              onCloseModal();
              setChallengeOption({
                challengeId: 0,
                text: "",
                correct: false,
                imageSrc: "",
                audioSrc: "",
              });
              setImageSrc(emptyImageSrc);
              setAudioSrc("");
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default UpsertChallengeOptionModal;
