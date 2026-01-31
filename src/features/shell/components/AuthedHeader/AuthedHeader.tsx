"use client";

import { useRouter } from "next/navigation";

import { signOutUser } from "@/core/auth/signOut";
import styles from "@/features/shell/components/AuthedHeader/AuthedHeader.module.scss";

export default function AuthedHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOutUser();
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
