"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export function useGithubSignIn() {
  const [isPending, setIsPending] = useState(false);

  return {
    isPending,
    signIn: async () => {
      if (isPending) return;

      setIsPending(true);

      try {
        await authClient.signIn.social({ provider: "github" });
      } catch (error) {
        setIsPending(false);
        throw error;
      }
    },
  };
}
