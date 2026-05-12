"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function GithubLoginSync() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("login") === "github") {
      router.replace("/dashboard", { scroll: false });
    }
  }, [router, searchParams]);

  return null;
}
