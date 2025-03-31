"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import {
  getUserProgress,
  upsertUserProgress,
} from "@/app/services/user-progress";
import { MAX_HEARTS } from "@/constants";
import { toast } from "sonner";
import { UserProgressDTOCreate } from "@/app/models/UserProgressDTO";
import { Button } from "@/components/ui/button";
export default function AuthCallback() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  const checkRoleAndRedirect = async () => {
    if (!isLoaded) return; // Đợi user tải xong
    if (!user?.id) return router.push("/");

    const role = user?.publicMetadata?.role;
    console.log(role);

    if (role === "admin") {
      router.replace("/admin");
      return;
    }

    const token = (await getToken()) as string;
    const userProgress = await getUserProgress(token, user?.id as string);

    if (!userProgress) {
      try {
        const newUserProgress: UserProgressDTOCreate = {
          userId: user?.id as string,
          hearts: MAX_HEARTS,
          points: 0,
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

  useEffect(() => {
    checkRoleAndRedirect();
  }, [user, isLoaded]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
