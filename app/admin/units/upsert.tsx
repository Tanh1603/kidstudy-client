/* eslint-disable import/order */
"use client";
import { useState, useEffect } from "react";

import { UnitDTOCreate } from "@/app/models/UnitDTO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUnits } from "./context";
import { toast } from "sonner";
const UpsertUnitModal = ({
  isOpen,
  onCloseModal,
}: {
  isOpen: boolean;
  onCloseModal: () => void;
}): React.ReactElement => {
  const { addUnit, updateUnit, currentUnit, setCurrentUnit } = useUnits();
  const [unit, setUnit] = useState<UnitDTOCreate>({
    title: "",
    description: "",
    order: 0,
  });

  useEffect(() => {
    if (currentUnit) {
      setUnit(currentUnit);
    }
  }, [currentUnit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnit((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (currentUnit) {
        await updateUnit({
          id: currentUnit.id,
          title: unit.title,
          description: unit.description,
          order: unit.order,
          lessons: currentUnit.lessons,
        });
        toast.success("Unit updated successfully");
      } else {
        await addUnit(unit);
        toast.success("Unit created successfully");
      }
      setUnit({
        title: "",
        description: "",
        order: 0,
      });
      onCloseModal();
    } catch (error) {
      console.error(error);
      toast.error("Error creating unit");
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[400px] rounded-md bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">
          {currentUnit ? "Edit Unit" : "Add New Unit"}
        </h2>
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
              value={unit.title}
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
              Description
            </Label>
            <Input
              id="description"
              name="description"
              type="text"
              value={unit.description}
              onChange={handleChange}
              className="mt-2 w-full border p-2"
              placeholder="Enter unit description"
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
              min={1}
              value={unit.order}
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
              setUnit({
                title: "",
                description: "",
                order: 1,
              });
              setCurrentUnit(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={() => void handleSubmit()}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default UpsertUnitModal;
