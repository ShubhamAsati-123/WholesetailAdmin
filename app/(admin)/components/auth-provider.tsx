"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth-utils";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = getAuthToken();

    if (!token) {
      // Redirect to login page if not authenticated
      router.push("/login");
    }
  }, [router]);

  return <>{children}</>;
}
