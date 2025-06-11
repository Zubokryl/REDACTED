"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/api";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await logoutUser();
      localStorage.removeItem("authData");
      router.push("/login");
    };
    logout();
  }, [router]);

  return <p className="text-center mt-10">Logging out...</p>;
}