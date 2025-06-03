/* eslint-disable import/order */
"use client";

import Image from "next/image";
import { useMediaQuery } from "../../../hooks/use-media-query";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Promo } from "@/components/promo";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Quests } from "@/components/quests";

const QuestsPage = () => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (isDesktop) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Not Found</h2>
          <p className="mt-2 text-gray-600">
            This page is only available on mobile devices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress hasActiveSubscription={false} />
        {false && <Promo />}
      </StickyWrapper>

      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <Image
            src="/quests.svg"
            alt="Quests"
            placeholder="empty"
            priority
            height={90}
            width={90}
          />

          <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
            Quests
          </h1>
          {/* <p className="mb-6 text-center text-lg text-muted-foreground">
            Complete quests by earning points.
          </p> */}

          <Quests />
        </div>
      </FeedWrapper>
    </div>
  );
};

export default QuestsPage;
