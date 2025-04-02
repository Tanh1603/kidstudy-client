/* eslint-disable import/order */
"use client";
import { useState, useEffect } from "react";

import { ChallengeDTOCreate } from "@/app/models/ChallengeDTO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChallenges } from "./context";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLessons } from "../lessons/context";
const UpsertChallengeModal = ({
  isOpen,
  onCloseModal,
}: {
  isOpen: boolean;
  onCloseModal: () => void;
}): React.ReactElement => {
  const { addChallenge, currentChallenge } = useChallenges();
  const { lessons } = useLessons();
  const [challenge, setChallenge] = useState<ChallengeDTOCreate>({
    lessonId: 0,
    type: "SELECT",
    question: "",
    audioSrc: "",
    order: 0,
  });

  useEffect(() => {
    if (currentChallenge) {
      setChallenge(currentChallenge);
    }
  }, [currentChallenge]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChallenge((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    addChallenge({
      ...challenge,
    });

    onCloseModal();
    setChallenge({
      lessonId: 0,
      type: "SELECT",
      question: "",
      audioSrc: "",
      order: 0,
    });
  };

  const handleChangeLesson = (value: string) => {
    setChallenge((prevState) => ({
      ...prevState,
      lessonId: parseInt(value),
    }));
  };

  const handleChangeType = (value: string) => {
    setChallenge((prevState) => ({
      ...prevState,
      type: value,
    }));
  };
  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-[800px] rounded-md bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">
          {currentChallenge ? "Edit Challenge" : "Add New Challenge"}   
        </h2>
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="lessonId"
              className="block text-sm font-medium text-gray-700"
            >
              Lesson
            </Label>
            <Select
              value={challenge.lessonId.toString()}
              onValueChange={handleChangeLesson}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a Lesson" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id.toString()}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700"
            >
              Question
            </Label>
            <Input
              id="question"
              name="question"
              type="text"
              value={challenge.question}
              onChange={handleChange}
              className="mt-2 w-full border p-2"
              placeholder="Enter unit description"
            />
          </div>
          <div>
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
              value={challenge.audioSrc}
              onChange={handleChange}
              className="mt-2 w-full border p-2"
              placeholder="Enter unit order"
            />
          </div>

          <div>
            <Label
              htmlFor="order"
              className="block text-sm font-medium text-gray-700"
            >
              Order
            </Label>
            <Input
              id="order"
              name="order"
              type="number"
              value={challenge.order}
              onChange={handleChange}
              className="mt-2 w-full border p-2"
              placeholder="Enter unit order"
            />
          </div>

          <div>
            <Label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Type
            </Label>
            <Select
              value={challenge.type}
              onValueChange={handleChangeType}
              defaultValue={challenge.type}
            >
              <SelectTrigger value={challenge.type}>
                <SelectValue placeholder="Select a Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SELECT">Select</SelectItem>
                <SelectItem value="ASSIST">Assist</SelectItem>
                <SelectItem value="LISTEN_TYPE">Listen Type</SelectItem>
                <SelectItem value="MATCH_IMAGE">Match Image</SelectItem>
                <SelectItem value="REARRANGE">Rearrange</SelectItem>
                <SelectItem value="TRANSLATE">Translate</SelectItem>
                <SelectItem value="SPEAK">Speak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="danger"
            className="mr-2"
            onClick={() => {
              onCloseModal();
              setChallenge({
                lessonId: 0,
                type: "",
                question: "",
                audioSrc: "",
                order: 0,
              });
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

export default UpsertChallengeModal;
