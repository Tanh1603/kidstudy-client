import { ClerkLoading, ClerkLoaded, UserButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { SidebarItem } from "./sidebar-item";

type SidebarProps = {
  className?: string;
  link?: {
    link: string;
    iconSrc: string;
  };
  sidebarItems: {
    label: string;
    href: string;
    iconSrc: string;
  }[];
};

export const Sidebar = ({ className, link, sidebarItems }: SidebarProps) => {
  return (
    <div
      className={cn(
        "left-0 top-0 flex h-full flex-col border-r-2 bg-yellow-100 px-4 lg:fixed lg:w-[256px]",
        className
      )}
    >
      <Link href={link?.link ?? "/"}>
        <div className="flex items-center gap-x-3 pb-7 pl-4 pt-8">
          <Image
            src={link?.iconSrc ?? "/bee.png"}
            alt="Mascot"
            height={40}
            width={40}
          />

          <h1 className="text-2xl font-extrabold tracking-wide text-yellow-600">
            KIDSTUDY
          </h1>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-y-2">
        {sidebarItems.map((item, index) => (
          <SidebarItem key={index} {...item} />
        ))}
      </div>

      <div className="p-4">
        <ClerkLoading>
          <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
        </ClerkLoading>

        <ClerkLoaded>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: { userButtonPopoverCard: { pointerEvents: "initial" } },
            }}
          />
        </ClerkLoaded>
      </div>
    </div>
  );
};
