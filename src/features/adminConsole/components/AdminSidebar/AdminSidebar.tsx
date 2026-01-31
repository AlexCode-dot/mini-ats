"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { signOutUser } from "@/core/auth/signOut";
import styles from "@/features/adminConsole/components/AdminSidebar/AdminSidebar.module.scss";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/admins", label: "Admins" },
];

function IconGrid() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
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
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M2 20c0-3 3-5 6-5" stroke="currentColor" strokeWidth="2" />
      <path d="M22 20c0-3-3-5-6-5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
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
  );
}

function getIcon(label: string) {
  if (label === "Dashboard") return <IconGrid />;
  if (label === "Customers") return <IconBuilding />;
  return <IconUsers />;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOutUser();
    router.replace("/login");
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandBox}>
        <div className={styles.brand}>Admin Console</div>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.link} ${isActive ? styles.active : ""}`}
            >
              {getIcon(item.label)}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className={styles.footer}>
        <button type="button" className={styles.logout} onClick={handleLogout}>
          <IconLogout />
          Logout
        </button>
      </div>
    </aside>
  );
}
