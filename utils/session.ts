"use client";

import React from "react";

import { signOut, useSession as useNextSession } from "next-auth/react";

import { redirect, RedirectType } from "next/navigation";

export function useSession() {
  const { status, data } = useNextSession();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login?error=Unauthorized", RedirectType.replace);
    }
  }, [status]);

  return {
    loading: status === "loading",
    authenticated: status === "authenticated",
    ...(data || {}),
    logout: () => signOut({ callbackUrl: "/login", redirect: true }),
  };
}
