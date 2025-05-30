import type { PropsWithChildren } from "react";

import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";

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
    label: "Quests",
    href: "/quests",
    iconSrc: "/quests.svg",
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
];

const link = {
  link: "/",
  iconSrc: "/bee.png",
};
const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <MobileHeader sidebarItems={data} link={link} />
      <Sidebar className="hidden lg:flex" link={link} sidebarItems={data} />
      <main className="h-full pt-[50px] lg:pl-[256px] lg:pt-0">
        <div className="mx-auto h-full max-w-[1056px] pt-6">{children}</div>
      </main>
    </>
  );
};

export default MainLayout;
