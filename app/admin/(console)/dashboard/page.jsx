"use client";

import { useEffect, useState } from "react";
import StatCard from "../../../../components/StatCard";
import styles from "./dashboard.module.css";

const ROLE_LABELS = {
  client: "Clients",
  coach: "Coachs",
  advisor: "Conseillers / Salles",
  manager: "Managers",
  admin: "Admins"
};

const STATUS_LABELS = {
  pending: "En attente",
  confirmed: "Confirmées",
  cancelled: "Annulées"
};

const ROLE_ICONS = {
  client: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  coach: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  advisor: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  manager: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  admin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
};

const STATUS_ICONS = {
  pending: "",
  confirmed: "",
  cancelled: ""
};

function Avatar({ src, alt, size = 40, className = "" }) {
  const [error, setError] = useState(false);
  const initials = alt
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  if (!src || error) {
    return (
      <div
        className={`${styles.avatarFallback} ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        title={alt}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${styles.avatarImg} ${className}`}
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur de chargement.");
        return res.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.retryBtn} onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.page}>
       <svg width="132" height="120" viewBox="0 0 132 120" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="65.6104" cy="17.25" r="17.25" fill="#D1F96B"/>
<path d="M5.8103 21.85C19.2827 35.9 45.0007 47.25 64.4603 47.7336M125.41 21.85C112.388 36.0329 83.709 48.212 64.4603 47.7336M64.4603 47.7336V106.95C87.8436 95.8333 128.4 73.37 103.56 72.45C78.7203 71.53 36.477 72.0666 18.4603 72.45" stroke="white" strokeWidth="16.1"/>
</svg>
      </div>
    );
  }

  const roleMap = Object.fromEntries(stats.usersByRole.map((r) => [r.role, Number(r.total)]));
  const statusMap = Object.fromEntries(
    stats.reservationsByStatus.map((r) => [r.status, Number(r.total)])
  );
  const totalReservations = Object.values(statusMap).reduce((a, b) => a + b, 0);
  const pendingApprovalsTotal = stats.pendingApprovals.reduce((a, r) => a + Number(r.total), 0);

  const confirmationRate = totalReservations > 0
    ? Math.round(((statusMap.confirmed || 0) / totalReservations) * 100)
    : 0;

  const top3Coaches = stats.topCoaches.slice(0, 3);

  return (
    <div className={`${styles.page} ${mounted ? styles.mounted : ""}`}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>// espace admin</span>
        <h1 className={styles.title}>Tableau de bord</h1>
        <p className={styles.subtitle}>
          Vue d'ensemble de l'activité Fitlek — comptes, réservations et modération.
        </p>
      </div>

      <section className={styles.grid}>
        <StatCard
          label="Comptes au total"
          value={stats.totalUsers}
          accent="brass"
          icon="users"
          trend={stats.totalUsers > 100 ? "+12%" : null}
        />
        <StatCard
          label="Réservations au total"
          value={totalReservations}
          sub={`${statusMap.confirmed || 0} confirmées`}
          accent="mint"
          icon="calendar"
          trend={totalReservations > 50 ? "+8%" : null}
        />
        <StatCard
          label="Revenu confirmé"
          value={`${stats.confirmedRevenue.toFixed(0)} MAD`}
          accent="brass"
          icon="dollar"
          trend={stats.confirmedRevenue > 5000 ? "+23%" : null}
        />
        <StatCard
          label="Comptes en attente"
          value={pendingApprovalsTotal}
          sub="coachs & conseillers à approuver"
          accent="amber"
          icon="clock"
          alert={pendingApprovalsTotal > 0}
        />
        <StatCard
          label="Bannissements actifs"
          value={stats.activeBans}
          accent="coral"
          icon="shield"
        />
      </section>

      <section className={styles.quickStats}>
        <div className={styles.quickStat}>
          <span className={styles.quickStatValue}>{confirmationRate}%</span>
          <span className={styles.quickStatLabel}>Taux de confirmation</span>
          <div className={styles.quickStatBar}>
            <div className={styles.quickStatFill} style={{ width: `${confirmationRate}%` }} />
          </div>
        </div>
        <div className={styles.quickStat}>
          <span className={styles.quickStatValue}>{stats.topCoaches.length}</span>
          <span className={styles.quickStatLabel}>Coachs notés</span>
        </div>
        <div className={styles.quickStat}>
          <span className={styles.quickStatValue}>
            {stats.confirmedRevenue > 0 ? (stats.confirmedRevenue / (statusMap.confirmed || 1)).toFixed(0) : 0}
          </span>
          <span className={styles.quickStatLabel}>MAD / réservation</span>
        </div>
      </section>

      <section className={styles.twoCol}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Répartition des comptes</h2>
            <span className={styles.panelBadge}>{stats.totalUsers} total</span>
          </div>
          <ul className={styles.barList}>
            {Object.entries(ROLE_LABELS).map(([role, label]) => {
              const count = roleMap[role] || 0;
              const pct = stats.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0;
              return (
                <li key={role} className={styles.barRow}>
                  <span className={styles.barLabel}>
                    <span className={styles.barIcon}>{ROLE_ICONS[role]}</span>
                    {label}
                  </span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${pct}%` }}
                      data-role={role}
                    />
                  </div>
                  <span className={styles.barValue}>{count}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Statuts des réservations</h2>
            <span className={styles.panelBadge}>{totalReservations} total</span>
          </div>
          <ul className={styles.barList}>
            {Object.entries(STATUS_LABELS).map(([status, label]) => {
              const count = statusMap[status] || 0;
              const pct = totalReservations ? Math.round((count / totalReservations) * 100) : 0;
              return (
                <li key={status} className={styles.barRow}>
                  <span className={styles.barLabel}>
                    <span className={styles.statusIcon}>{STATUS_ICONS[status]}</span>
                    {label}
                  </span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      data-tone={status}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={styles.barValue}>{count}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Coachs les mieux notés</h2>
          <span className={styles.panelBadge}>{stats.topCoaches.length} coachs</span>
        </div>
        {stats.topCoaches.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c0c5b8" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p className={styles.emptyNote}>Aucun avis coach pour le moment.</p>
          </div>
        ) : (
          <>
            {top3Coaches.length > 0 && (
              <div className={styles.podium}>
                {top3Coaches.map((c, i) => (
                  <div key={c.id} className={`${styles.podiumItem} ${styles[`podiumRank${i + 1}`]}`}>
                    <div className={styles.podiumRank}>{i === 0 ? "" : i === 1 ? "" : ""}</div>
                    <Avatar
                      src={c.avatarUrl}
                      alt={`${c.firstName} ${c.lastName}`}
                      size={64}
                      className={styles.podiumAvatarImg}
                    />
                    <div className={styles.podiumName}>{c.firstName} {c.lastName}</div>
                    <div className={styles.podiumRating}>⭐ {Number(c.avgRating).toFixed(1)}</div>
                    <div className={styles.podiumReviews}>{c.totalReviews} avis</div>
                  </div>
                ))}
              </div>
            )}
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Coach</th>
                  <th>Avis</th>
                  <th>Note moyenne</th>
                </tr>
              </thead>
              <tbody>
                {stats.topCoaches.map((c, i) => (
                  <tr key={c.id} className={i < 3 ? styles.topRow : ""}>
                    <td>
                      <span className={`${styles.rankBadge} ${i < 3 ? styles[`rank${i + 1}`] : ""}`}>
                        #{i + 1}
                      </span>
                    </td>
                    <td>
                      <div className={styles.coachCell}>
                        <Avatar
                          src={c.avatarUrl}
                          alt={`${c.firstName} ${c.lastName}`}
                          size={36}
                        />
                        <span>{c.firstName} {c.lastName}</span>
                      </div>
                    </td>
                    <td className="mono">{c.totalReviews}</td>
                    <td className="mono">
                      <span className={styles.ratingStars}>
                        {"⭐".repeat(Math.round(Number(c.avgRating)))}
                      </span>
                      <span className={styles.ratingValue}>{Number(c.avgRating).toFixed(1)} / 5</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <footer className={styles.footer}>
        <p>Dashboard Fitlek · Mis à jour {new Date().toLocaleDateString("fr-FR")}</p>
      </footer>
    </div>
  );
}