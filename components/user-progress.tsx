/* eslint-disable import/order */
"user client";

import { InfinityIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import Loading from "./loading";
import { useCurrentUserProgress } from "@/hooks/use-user-progress-hook";
// import { courses } from "@/db/schema";

type UserProgressProps = {
  hasActiveSubscription: boolean;
};

export const UserProgress = ({ hasActiveSubscription }: UserProgressProps) => {
  const { data: current, isLoading, error } = useCurrentUserProgress();

  if (isLoading) return <Loading />;
  if (error) return <div>Error....</div>;
  if (!current) return null;

  return (
    <div className="flex w-full items-center justify-between gap-x-2">
      <Link href="/shop">
        <Button variant="ghost" className="text-orange-500">
          <Image
            src="/points.svg"
            height={28}
            width={28}
            alt="Points"
            className="mr-2"
          />
          {/* {points} */}
          {current?.points}
        </Button>
      </Link>

      <Link href="/shop">
        <Button variant="ghost" className="text-rose-500">
          <Image
            src="/heart.svg"
            height={22}
            width={22}
            alt="Hearts"
            className="mr-2"
          />
          {hasActiveSubscription ? (
            <InfinityIcon className="stroke-3 h-4 w-4" />
          ) : (
            //
            current?.hearts
          )}
        </Button>
      </Link>

      <Link href="/shop">
        <Button variant="ghost" className="text-orange-500">
          <Image
            src="/tickets.svg"
            height={28}
            width={28}
            alt="tickets"
            className="mr-2"
          />
          {/* {points} */}
          {current?.tickets}
        </Button>
      </Link>
    </div>
  );
};
