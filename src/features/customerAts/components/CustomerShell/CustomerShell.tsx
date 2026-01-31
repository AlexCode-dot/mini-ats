"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import CustomerUserMenu from "@/features/customerAts/components/CustomerUserMenu/CustomerUserMenu";
import styles from "@/features/customerAts/components/CustomerShell/CustomerShell.module.scss";

type CustomerShellProps = {
  orgName: string;
  children: ReactNode;
};

const mobileTabs = [
  { href: "/candidates", label: "Candidates", icon: "users" },
  { href: "/jobs", label: "Jobs", icon: "briefcase" },
];

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={styles.mobileIcon}>
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 20c0-3.5 2.8-6.5 6.5-6.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="17" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M13 20c0-2.8 2.2-5 5-5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={styles.mobileIcon}>
      <rect
        x="3"
        y="7"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function getIcon(name: string) {
  return name === "users" ? <IconUsers /> : <IconBriefcase />;
}

export default function CustomerShell({
  orgName,
  children,
}: CustomerShellProps) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <div className={styles.orgName}>{orgName}</div>
          <nav className={styles.tabs}>
            <Link
              className={`${styles.tabLink} ${pathname === "/candidates" ? styles.tabActive : ""}`}
              href="/candidates"
            >
              Candidates
            </Link>
            <Link
              className={`${styles.tabLink} ${pathname === "/jobs" ? styles.tabActive : ""}`}
              href="/jobs"
            >
              Jobs
            </Link>
          </nav>
        </div>
        <CustomerUserMenu />
      </header>
      <main className={styles.content}>{children}</main>
      <nav className={styles.mobileTabs}>
        {mobileTabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${styles.mobileTab} ${isActive ? styles.mobileTabActive : ""}`}
            >
              {getIcon(tab.icon)}
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
