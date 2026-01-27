import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import AuthedHeader from "@/features/shell/components/AuthedHeader/AuthedHeader";
import { getCurrentProfile } from "@/core/auth/getCurrentProfile";
import { requireSession } from "@/core/auth/requireSession";
import styles from "@/app/(authed)/layout.module.scss";

export default async function AuthedLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSession();

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.profile.is_active || !profile.org.is_active) {
    redirect("/login?reason=inactive");
  }

  return (
    <div className={styles.container}>
      <AuthedHeader />
      {children}
    </div>
  );
}
