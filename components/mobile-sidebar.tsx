import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Sidebar } from "./sidebar";
type MobileSidebarProps = {
  sidebarItems: {
    label: string;
    href: string;
    iconSrc: string;
  }[];
  link?: {
    link: string;
    iconSrc: string;
  };
};

export const MobileSidebar = ({ sidebarItems }: MobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="text-white" />
      </SheetTrigger>

      <SheetContent className="z-[100] p-0" side="left">
        <Sidebar sidebarItems={sidebarItems} />
      </SheetContent>
    </Sheet>
  );
};
