"use client"

import { useParams as useNextParams } from "next/navigation";

export function useParams() {
  const { repo, page } = useNextParams<{ repo: string, page?: string[] }>();

  return { repo, page: page?.[0] || null };
}