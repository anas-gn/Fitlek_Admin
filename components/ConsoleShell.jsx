"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./ConsoleShell.module.css";

const NAV = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: DashboardIcon },
  { href: "/admin/users", label: "Comptes", icon: UsersIcon },
  { href: "/admin/reservations", label: "Réservations", icon: CalendarIcon },
  { href: "/admin/bans", label: "Bannissements", icon: BanIcon },
  { href: "/admin/register", label: "Nouvel admin", icon: AddUserIcon }
];

// Logo SVG Component
function Logo({ className }) {
  return (
   <img src="/logoFitlek.png" width="190" height="70" alt="Logo Fitlek" className={className} />
  );
}

export default function ConsoleShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.admin) setAdmin(data.admin);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logoWrap}>
            <Logo />
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <p className={styles.footerNote}>
            Gestion des comptes, des bannissements et des réservations SERVIA.
          </p>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div />
          <div className={styles.topbarRight}>
            {admin && (
              <span className={styles.adminName}>
                {admin.name || admin.email}
              </span>
            )}
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z" fill="currentColor" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 2v2H5a2 2 0 0 0-2 2v3h18V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7ZM3 20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V11H3v9Z"
        fill="currentColor"
      />
    </svg>
  );
}
function BanIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.32 4.9L6.9 18.32A8 8 0 0 1 18.32 6.9ZM5.68 17.1 17.1 5.68A8 8 0 0 1 5.68 17.1Z"
        fill="currentColor"
      />
    </svg>
  );
}
function AddUserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M10 11c1.93 0 3.5-1.57 3.5-3.5S11.93 4 10 4 6.5 5.57 6.5 7.5 8.07 11 10 11Zm0 2c-2.67 0-8 1.34-8 4v2h11.09c-.06-.32-.09-.66-.09-1a5.5 5.5 0 0 1 .8-2.87C12.66 14.42 11.13 13 10 13Zm9 1v-2h-2v2h-2v2h2v2h2v-2h2v-2h-2Z"
        fill="currentColor"
      />
    </svg>
  );
}