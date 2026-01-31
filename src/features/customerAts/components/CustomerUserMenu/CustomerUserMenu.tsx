"use client";

import { useEffect, useState } from "react";

import { useMe } from "@/core/auth/useMe";
import { signOutUser } from "@/core/auth/signOut";
import styles from "@/features/customerAts/components/CustomerUserMenu/CustomerUserMenu.module.scss";

export default function CustomerUserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useMe();

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-user-menu="true"]')) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const handleLogout = async () => {
    await signOutUser();
    window.location.href = "/login";
  };

  return (
    <div className={styles.userMenu} data-user-menu="true">
      <button
        type="button"
        className={styles.userButton}
        onClick={() => setIsOpen((prev) => !prev)}
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
      {isOpen ? (
        <div className={styles.userDropdown}>
          <div className={styles.userName}>{profile.name ?? "User"}</div>
          {profile.email ? (
            <div className={styles.userEmail}>{profile.email}</div>
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
  );
}
