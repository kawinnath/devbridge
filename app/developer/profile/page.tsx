"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeContext";

export default function DefaultDeveloperProfile() {
  const { isLoggedIn, user } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn && user && user.role === "DEVELOPER") {
      router.replace(`/developer/profile/${user.id}`);
    } else {
      router.replace("/auth");
    }
  }, [isLoggedIn, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-xs text-gray-500">
      <span className="animate-spin h-5 w-5 border-2 border-violet-500 border-t-transparent rounded-full mr-2" />
      Redirecting to profile...
    </div>
  );
}
