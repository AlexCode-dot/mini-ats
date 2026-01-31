"use client";

import { useEffect, useState } from "react";

export type MeProfile = {
  name: string | null;
  email: string | null;
};

export function useMe() {
  const [profile, setProfile] = useState<MeProfile>({
    name: null,
    email: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/me");
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as MeProfile;
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return { profile, error, isLoading };
}
