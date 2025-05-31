/* eslint-disable import/order */
"use client";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { UnitFormModal } from "@/components/modals/admin/unit-form-modal";
import { LessonFormModal } from "@/components/modals/admin/lesson-form-modal";
import { ChallengeFormModal } from "@/components/modals/admin/challenge-form-modal";
import ChallengeOptionFormModal from "@/components/modals/admin/challenge-option-form-modal";
import UpsertAnagramQuestion from "./mini-games/upsert-anagrm";
import { useAdminModal } from "@/store/use-admin-store";
import UpsertMatchUpQuestion from "./mini-games/upsert-matchup";
import UpsertSpellingBeeQuestion from "./mini-games/upsert-spellingbee";
import UpsertMemoryQuestion from "./mini-games/upsert-memory";

const data = [
  {
    label: "Units",
    href: "/admin/units",
    iconSrc: "/target.svg",
  },
  {
    label: "Lessons",
    href: "/admin/lessons",
    iconSrc: "/books.svg",
  },
  {
    label: "Challenges",
    href: "/admin/challenges",
    iconSrc: "/fire.svg",
  },
  {
    label: "Mini games",
    href: "/admin/mini-games",
    iconSrc: "/minigame.svg",
  },
];

const link = {
  link: "/admin",
  iconSrc: "/admin.svg",
};
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { type } = useAdminModal();
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
      {type === "challenge-options" && <ChallengeOptionFormModal />}
      {type === "anagram" && <UpsertAnagramQuestion />}
      {type === "match-up" && <UpsertMatchUpQuestion />}
      {type === "spelling-bee" && <UpsertSpellingBeeQuestion />}
      {type === "memory" && <UpsertMemoryQuestion />}
    </>
  );
};

export default AdminLayout;
