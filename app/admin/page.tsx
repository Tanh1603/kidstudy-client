/* eslint-disable import/order */
"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
const AdminPage = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = () => {
      if (!user) {
        router.push("/");
        return;
      }
      if (user.publicMetadata.role === "admin") {
        router.push("/admin/units");
        return;
      }
      router.push("/");
    };
    void fetchUser();
  }, [router, user]);

  return null;
};

export default AdminPage;
