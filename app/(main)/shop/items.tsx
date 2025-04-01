"use client";

import { useTransition } from "react";

import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { toast } from "sonner";

// import { refillHearts } from "@/actions/user-progress";
// import { createStripeUrl } from "@/actions/user-subscription";
import UserProgressDTO from "@/app/models/UserProgressDTO";
import { refillHearts } from "@/app/services/user-progress";
import { Button } from "@/components/ui/button";
import { MAX_HEARTS, POINTS_TO_REFILL } from "@/constants";
type ItemsProps = {
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
  userProgress: UserProgressDTO;
  setUserProgress: (userProgress: UserProgressDTO) => void;
};

export const Items = ({
  hearts,
  points,
  hasActiveSubscription,
  userProgress,
  setUserProgress,
}: ItemsProps) => {
  const { userId, getToken } = useAuth();
  const [pending, startTransition] = useTransition();

  const onRefillHearts = () => {
    if (pending || hearts === MAX_HEARTS || points < POINTS_TO_REFILL) return;

    startTransition(async () => {
      const token = (await getToken()) as string;
      refillHearts(token, userId as string).catch((error) =>
        toast.error(error.message)
      );
      setUserProgress({
        ...userProgress,
        hearts: MAX_HEARTS,
        points: points - POINTS_TO_REFILL,
      });
    });
  };

  // const onUpgrade = () => {
  //   toast.loading("Redirecting to checkout...");
  //   startTransition(() => {
  //     createStripeUrl()
  //       .then((response) => {
  //         if (response.data) window.location.href = response.data;
  //       })
  //       .catch(() => toast.error("Something went wrong."));
  //   });
  // };

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
          onClick={onRefillHearts}
          disabled={
            pending || hearts === MAX_HEARTS || points < POINTS_TO_REFILL
          }
          aria-disabled={
            pending || hearts === MAX_HEARTS || points < POINTS_TO_REFILL
          }
        >
          {hearts === MAX_HEARTS ? (
            "full"
          ) : (
            <div className="flex items-center">
              <Image src="/points.svg" alt="Points" height={20} width={20} />

              <p>{POINTS_TO_REFILL}</p>
            </div>
          )}
        </Button>
      </div>

      {/* <div className="flex w-full items-center gap-x-4 border-t-2 p-4 pt-8">
        <Image src="/unlimited.svg" alt="Unlimited" height={60} width={60} />

        <div className="flex-1">
          <p className="text-base font-bold text-neutral-700 lg:text-xl">
            Unlimited hearts
          </p>
        </div>

        <Button onClick={onUpgrade} disabled={pending} aria-disabled={pending}>
          {hasActiveSubscription ? "settings" : "upgrade"}
        </Button>
      </div> */}
    </ul>
  );
};
