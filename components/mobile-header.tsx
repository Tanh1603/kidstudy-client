import { MobileSidebar } from "./mobile-sidebar";

type MobileHeaderProps = {
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
export const MobileHeader = ({ sidebarItems, link }: MobileHeaderProps) => {
  return (
    <nav className="fixed top-0 z-50 flex h-[50px] w-full items-center border-b bg-yellow-500 px-4 lg:hidden">
      <MobileSidebar sidebarItems={sidebarItems} link={link} />
    </nav>
  );
};
