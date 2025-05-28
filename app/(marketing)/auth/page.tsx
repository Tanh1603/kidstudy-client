"use client";

import { useEffect } from "react";

import { useAuth, useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { UserProgressDTOCreate } from "@/app/models/UserProgressDTO";
import {
  getUserProgress,
  upsertUserProgress,
} from "@/app/services/user-progress";
import { MAX_HEARTS, INITIAL_POINT_HEARTS } from "@/constants";
export default function AuthCallback() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (!isLoaded) return; // Đợi user tải xong
      if (!user?.id) return router.push("/");

      const role = user?.publicMetadata?.role;

      if (role === "admin") {
        router.replace("/admin");
        return;
      }

      const token = (await getToken()) as string;
      const userProgress = await getUserProgress(token, user?.id);

      if (!userProgress) {
        try {
          const newUserProgress: UserProgressDTOCreate = {
            userId: user?.id,
            hearts: MAX_HEARTS,
            points: INITIAL_POINT_HEARTS,
            userName:
              user?.fullName ||
              user?.username ||
              user?.emailAddresses[0].emailAddress ||
              "",
            userImageSrc: user?.imageUrl || "/boy.svg",
          };
          await upsertUserProgress(token, newUserProgress);
        } catch (error) {
          console.log(error);
          toast.error("Failed to create user progress");
        }
      }

      router.replace("/learn");
    };
    void checkRoleAndRedirect();
  }, [user, isLoaded, router, getToken]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
