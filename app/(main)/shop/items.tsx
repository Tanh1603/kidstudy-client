/* eslint-disable import/order */
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MAX_HEARTS, POINTS_TO_REFILL } from "@/constants";
import {
  useCurrentUserProgress,
  useRefillHeart,
  useUpsertUserProgress,
} from "@/hooks/use-user-progress-hook";
import Loading from "./loading";
import Error from "@/components/error";
import { UserProgressDTOCreate } from "@/app/models/UserProgressDTO";
import { toast } from "sonner";

export const Items = () => {
  const { data, error, isLoading } = useCurrentUserProgress();
  const create = useUpsertUserProgress();
  const refill = useRefillHeart();

  if (isLoading || refill.isPending) return <Loading />;
  if (!data || error) return <Error />;

  const handlePurchaseTicket = () => {
    if (data.points < 100) {
      toast.error("Not enough points to purchase tickets.");
      return;
    }
    const updateUserProgress = {
      ...data,
      tickets: data.tickets + 5,
      points: data.points - 100,
    };
    create.mutate(updateUserProgress as UserProgressDTOCreate);
  };

  return (
    <ul className="w-full">
      <div className="flex w-full items-center gap-x-4 border-t-2 p-4">
        <Image src="/heart.svg" alt="Heart" height={60} width={60} />

        <div className="flex-1">
          <p className="text-base font-bold text-neutral-700 lg:text-xl">
            Refill hearts
          </p>
        </div>

        <Button
          onClick={() => refill.mutate()}
          disabled={
            refill.isPending ||
            data.hearts === MAX_HEARTS ||
            data.points < POINTS_TO_REFILL
          }
          aria-disabled={
            refill.isPending ||
            data.hearts === MAX_HEARTS ||
            data.points < POINTS_TO_REFILL
          }
        >
          {data.hearts === MAX_HEARTS ? (
            "full"
          ) : (
            <div className="flex items-center">
              <Image src="/points.svg" alt="Points" height={20} width={20} />
              <p>{POINTS_TO_REFILL}</p>
            </div>
          )}
        </Button>
      </div>

      <div className="flex w-full items-center gap-x-4 border-t-2 p-4">
        <Image src="/tickets.svg" alt="Ticket" height={60} width={60} />

        <div className="flex-1">
          <p className="text-base font-bold text-neutral-700 lg:text-xl">
            Purchase Ticket x5
          </p>
        </div>

        <Button onClick={() => handlePurchaseTicket()}>
          <div className="flex items-center">
            <Image src="/points.svg" alt="Points" height={20} width={20} />
            <p>{create.isPending ? <Loading /> : 100}</p>
          </div>
        </Button>
      </div>
    </ul>
  );
};
