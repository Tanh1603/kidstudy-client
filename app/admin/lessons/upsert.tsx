/* eslint-disable import/order */
"use client";
import { useState, useEffect } from "react";

import { LessonDTOCreate } from "@/app/models/Lesson";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLessons } from "./context";
import { useUnits } from "../units/context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const UpsertLessonModal = ({
  isOpen,
  onCloseModal,
}: {
  isOpen: boolean;
  onCloseModal: () => void;
}): React.ReactElement => {
  const { addLesson, currentLesson } = useLessons();
  const { units } = useUnits();
  const [lesson, setLesson] = useState<LessonDTOCreate>({
    title: "",
    unitId: 0,
    order: 0,
  });

  useEffect(() => {
    if (currentLesson) {
      setLesson(currentLesson);
    }
  }, [currentLesson]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLesson((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    addLesson(lesson);
    onCloseModal();
    setLesson({
      title: "",
      unitId: 0,
      order: 0,
    });
  };

  const handleChangeUnit = (value: string) => {
    setLesson((prevState) => ({
      ...prevState,
      unitId: parseInt(value),
    }));
  };

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[400px] rounded-md bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Add New Lesson</h2>
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={lesson.title}
              onChange={handleChange}
              className="mt-2 w-full border p-2"
              placeholder="Enter unit title"
            />
          </div>
          <div>
            <Label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Unit
            </Label>
            <Select
              value={lesson.unitId.toString()}
              onValueChange={handleChangeUnit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a Unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              min={0}
              value={lesson.order}
              onChange={handleChange}
              className="mt-2 w-full border p-2"
              placeholder="Enter unit order"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="danger"
            className="mr-2"
            onClick={() => {
              onCloseModal();
              setLesson({
                title: "",
                unitId: 0,
                order: 0,
              });
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Add Lesson
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default UpsertLessonModal;
