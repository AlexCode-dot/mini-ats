"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { createBrowserSupabaseClient } from "@/core/supabase/browserClient";
import AdminSidebar from "@/features/adminConsole/components/AdminSidebar/AdminSidebar";
import styles from "@/features/adminConsole/components/AdminShell/AdminShell.module.scss";

const mobileNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/admins", label: "Admins" },
];

function IconHome() {
  return (
    <svg className={styles.mobileIcon} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-6v-7H10v7H4a1 1 0 0 1-1-1v-10.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg className={styles.mobileIcon} viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 8h2M8 12h2M8 16h2M14 8h2M14 12h2M14 16h2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg className={styles.mobileIcon} viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M2 20c0-3 3-5 6-5" stroke="currentColor" strokeWidth="2" />
      <path d="M22 20c0-3-3-5-6-5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function getMobileIcon(label: string) {
  if (label === "Dashboard") return <IconHome />;
  if (label === "Customers") return <IconBuilding />;
  return <IconUsers />;
}

type AdminShellProps = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function AdminShell({
  title,
  actions,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [profileLabel, setProfileLabel] = useState("Admin User");
  const [profileEmail, setProfileEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/me");
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as {
          name: string | null;
          email: string | null;
        };
        if (isMounted) {
          setProfileLabel(data.name ?? "Admin User");
          setProfileEmail(data.email ?? null);
        }
      } catch {
        // Ignore failures to keep shell stable.
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-user-menu="true"]')) {
        return;
      }
      setIsUserMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <div>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <div className={styles.title}>{title}</div>
            {actions ? <div className={styles.actions}>{actions}</div> : null}
          </div>
          <div className={styles.userMenu} data-user-menu="true">
            <button
              type="button"
              className={styles.userButton}
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
            >
              <span className={styles.userAvatar}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
            {isUserMenuOpen ? (
              <div className={styles.userDropdown}>
                <div className={styles.userName}>{profileLabel}</div>
                {profileEmail ? (
                  <div className={styles.userEmail}>{profileEmail}</div>
                ) : null}
                <button
                  type="button"
                  className={styles.userLogout}
                  onClick={handleLogout}
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M9 12h10m0 0-3-3m3 3-3 3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 5a2 2 0 0 1 2-2h4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M11 19H7a2 2 0 0 1-2-2V7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </header>
        <main className={styles.content}>{children}</main>
        <nav className={styles.mobileNav}>
          {mobileNavItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileLink} ${isActive ? styles.mobileActive : ""}`}
              >
                {getMobileIcon(item.label)}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
