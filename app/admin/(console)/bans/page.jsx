"use client";

import { useEffect, useState, useCallback } from "react";
import Badge from "../../../../components/Badge";
import t from "./page.module.css";
const ROLE_LABELS = {
  client: "Client",
  coach: "Coach",
  advisor: "Conseiller",
  manager: "Manager",
  admin: "Admin"
};

const ROLE_COLORS = {
  client: "#4a90d9",
  coach: "#5a6e0a",
  advisor: "#f5a623",
  manager: "#bd5cff",
  admin: "#ff5a36"
};

function Avatar({ src, alt, size = 40 }) {
  const [error, setError] = useState(false);
  const initials = alt?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  if (!src || error) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #c6f135, #a8d420)",
          color: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.4,
          fontWeight: 700,
          flexShrink: 0,
          border: "2px solid #e0e2dc"
        }}
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
      onError={() => setError(true)}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
        border: "2px solid #e0e2dc"
      }}
    />
  );
}

export default function BansPage() {
  const [bans, setBans] = useState([]);
  const [activeOnly, setActiveOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [mounted, setMounted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (activeOnly) params.set("active", "1");
      const res = await fetch(`/api/bans?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur lors du chargement des bannissements.");
      const data = await res.json();
      setBans(data.bans);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    setMounted(true);
    load();
  }, [load]);

  async function lift(ban) {
    setBusyId(ban.id);
    try {
      const res = await fetch(`/api/bans/${ban.id}/lift`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Action impossible.");
      }
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  }

  const activeCount = bans.filter((b) => b.isActive).length;
  const liftedCount = bans.filter((b) => !b.isActive).length;

  return (
    <div className={`${t.page} ${mounted ? t.mounted : ""}`}>
      <div className={t.header}>
        <span className={t.eyebrow}>// espace admin</span>
        <h1 className={t.title}>Bannissements</h1>
        <p className={t.subtitle}>Historique complet des sanctions appliquées aux comptes.</p>
      </div>

      <div className={t.filters}>
        <div className={t.filterToggle}>
          <label className={t.toggleLabel}>
            <input
              type="checkbox"
              className={t.toggleInput}
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
            />
            <span className={t.toggleSlider}></span>
            <span className={t.toggleText}>Actifs uniquement</span>
          </label>
        </div>
        <div className={t.statsPills}>
          <span className={`${t.statPill} ${t.statPillActive}`}>
            <span className={t.statDot} style={{ background: "#ff5a36" }}></span>
            {activeCount} actif{activeCount > 1 ? "s" : ""}
          </span>
          <span className={t.statPill}>
            <span className={t.statDot} style={{ background: "#8b9280" }}></span>
            {liftedCount} levé{liftedCount > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className={t.panel}>
        {loading ? (
          <div className={t.loadingState}>
            <div className={t.spinner} />
            <p>Chargement des bannissements…</p>
          </div>
        ) : error ? (
          <div className={t.errorBanner} role="alert">
            {error}
          </div>
        ) : bans.length === 0 ? (
          <div className={t.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#c0c5b8" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
            </svg>
            <p>Aucun bannissement enregistré.</p>
          </div>
        ) : (
          <>
            <div className={t.resultsBar}>
              <span className={t.resultsCount}>
                {bans.length} sanction{bans.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Rôle</th>
                    <th>Type</th>
                    <th>Motif</th>
                    <th>Banni le</th>
                    <th>Expire le</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bans.map((b) => {
                    const roleColor = ROLE_COLORS[b.userRole] || "#8b9280";
                    return (
                      <tr key={b.id} className={b.isActive ? t.rowActive : t.rowInactive}>
                        <td>
                          <div className={t.userCell}>
                            <Avatar src={b.userAvatarUrl} alt={`${b.userFirstName} ${b.userLastName}`} size={40} />
                            <div className={t.userInfo}>
                              <span className={t.userName}>{b.userFirstName} {b.userLastName}</span>
                              <span className={t.userEmail}>{b.userEmail}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={t.rolePill}
                            style={{
                              backgroundColor: `${roleColor}15`,
                              color: roleColor,
                              borderColor: `${roleColor}30`
                            }}
                          >
                            {ROLE_LABELS[b.userRole] || b.userRole}
                          </span>
                        </td>
                        <td>
                          <span className={t.typePill} data-type={b.banType}>
                            {b.banType === "permanent" ? "Permanent" : "Temporaire"}
                          </span>
                        </td>
                        <td className={t.reasonCell}>{b.reason}</td>
                        <td className={t.mono}>{formatDateTime(b.bannedAt)}</td>
                        <td className={t.mono}>
                          {b.expiresAt ? (
                            <span className={b.isActive ? t.expirySoon : t.expiryDone}>
                              {formatDateTime(b.expiresAt)}
                            </span>
                          ) : (
                            <span className={t.muted}>—</span>
                          )}
                        </td>
                        <td>
                          <span className={`${t.statusPill} ${b.isActive ? t.statusCoral : t.statusMuted}`}>
                            {b.isActive ? "Actif" : "Levé"}
                          </span>
                        </td>
                        <td>
                          {b.isActive ? (
                            <button
                              className={`${t.btn} ${t.btnPositive}`}
                              disabled={busyId === b.id}
                              onClick={() => lift(b)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                              </svg>
                              <span>Lever</span>
                            </button>
                          ) : (
                            <span className={t.muted}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}