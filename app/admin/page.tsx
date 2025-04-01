/* eslint-disable import/order */
"use client";
import { useUser } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";
const AdminPage = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) {
        router.push("/");
        return;
      }
      console.log("user", user);

      if (user.publicMetadata.role === "admin") {
        router.push("/admin/units");
        return;
      }
      router.push("/");
    };
    void fetchUser();
  }, [user]);

  return null;
};

export default AdminPage;
