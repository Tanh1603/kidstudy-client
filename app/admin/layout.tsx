import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
// import { Sidebar } from "@/components/sidebar";

const data = [
  {
    label: "Units",
    href: "/admin/units",
    iconSrc: "/unit.png",
  },
  {
    label: "Lessons",
    href: "/admin/lessons",
    iconSrc: "/lesson.png",
  },
  {
    label: "Challenges",
    href: "/admin/challenges",
    iconSrc: "/challenge.jpg",
  },
  {
    label: "Challenge Options",
    href: "/admin/challenge-options",
    iconSrc: "/option.png",
  },
];

const link = {
  link: "/admin",
  iconSrc: "/admin.svg",
};
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <MobileHeader sidebarItems={data} link={link} />
      <Sidebar className="hidden lg:flex" sidebarItems={data} />
      <main className="h-full pt-[50px] lg:pl-[256px] lg:pt-0">
        <div className="mx-auto h-full max-w-[1056px] pt-6">{children}</div>
      </main>
    </>
  );
};

export default AdminLayout;

