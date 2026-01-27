"use client";

import { useRouter } from "next/navigation";

import { createBrowserSupabaseClient } from "@/core/supabase/browserClient";
import styles from "@/features/shell/components/AuthedHeader/AuthedHeader.module.scss";

export default function AuthedHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <header className={styles.header}>
      <strong>Mini ATS</strong>
      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}
