/* eslint-disable import/order */
"use client";
import { useEffect, type PropsWithChildren } from "react";

import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { useResetDailyQuest } from "@/hooks/use-quest-hook";
import Error from "@/components/error";

const mobileData = [
  {
    label: "Learn",
    href: "/learn",
    iconSrc: "/learn.svg",
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    iconSrc: "/leaderboard.svg",
  },
  {
    label: "Shop",
    href: "/shop",
    iconSrc: "/shop.svg",
  },
  {
    label: "Quests",
    href: "/quests",
    iconSrc: "/quests.svg",
  },
  {
    label: "Mini games",
    href: "/mini-games",
    iconSrc: "/mini-games.svg",
  },
  {
    label: "AI",
    href: "/chat-with-ai",
    iconSrc: "/quests.svg",
  },
];

const data = [
  {
    label: "Learn",
    href: "/learn",
    iconSrc: "/learn.svg",
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    iconSrc: "/leaderboard.svg",
  },
  {
    label: "Shop",
    href: "/shop",
    iconSrc: "/shop.svg",
  },
    {
    label: "Friend",
    href: "/friend",
    iconSrc: "/friend.svg",
  },
  {
    label: "Chat",
    href: "/chat",
    iconSrc: "/chat.svg",
  },
  {
    label: "Mini games",
    href: "/mini-games",
    iconSrc: "/mini-games.svg",
  },
  {
    label: "AI",
    href: "/chat-with-ai",
    iconSrc: "/robot-avatar.svg",
  },
];

const link = {
  link: "/",
  iconSrc: "/bee.png",
};
const MainLayout = ({ children }: PropsWithChildren) => {
  const { mutate, isError } = useResetDailyQuest();

  useEffect(() => {
    const lastResetTime = localStorage.getItem("lastQuestReset");
    const now = new Date();
    const today = now.toDateString();

    if (lastResetTime !== today) {
      void mutate();
      localStorage.setItem("lastQuestReset", today);
    }
  }, [mutate]);

  // if (isPending) return <Loading />;
  if (isError) return <Error />;

  return (
    <>
      <MobileHeader sidebarItems={mobileData} link={link} />
      <Sidebar className="hidden lg:flex" link={link} sidebarItems={data} />
      <main className="h-full pt-[50px] lg:pl-[256px] lg:pt-0">
        <div className="mx-auto h-full max-w-[1056px] pt-6">{children}</div>
      </main>
    </>
  );
};

export default MainLayout;
