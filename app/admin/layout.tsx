/* eslint-disable import/order */
"use client";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { UnitFormModal } from "@/components/modals/admin/unit-form-modal";
import { LessonFormModal } from "@/components/modals/admin/lesson-form-modal";
import { ChallengeFormModal } from "@/components/modals/admin/challenge-form-modal";
import ChallengeOptionFormModal from "@/components/modals/admin/challenge-option-form-modal";

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
        <div className="mx-auto h-full max-w-full p-2">{children}</div>
      </main>

      <UnitFormModal />
      <LessonFormModal />
      <ChallengeFormModal />
      <ChallengeOptionFormModal />
    </>
  );
};

export default AdminLayout;
