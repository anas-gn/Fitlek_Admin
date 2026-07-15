"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Badge from "../../../../components/Badge";
import Modal from "../../../../components/Modal";
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

function Avatar({ src, alt, size = 36 }) {
  const [error, setError] = useState(false);
  const initials = alt?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  if (!src || error) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1A7A7A, #104e4e)",
          color: "white",
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

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const [banTarget, setBanTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [profileTarget, setProfileTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (role !== "all") params.set("role", role);
      if (status !== "all") params.set("status", status);
      if (search) params.set("search", search);

      const res = await fetch(`/api/users?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur lors du chargement des comptes.");
      const data = await res.json();
      setUsers(data.users);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [role, status, search]);

  useEffect(() => {
    setMounted(true);
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  async function toggleApprove(user) {
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve: !user.isApproved })
      });
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

  async function unban(user) {
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}/unban`, { method: "POST" });
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

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Suppression impossible.");
      }
      setDeleteTarget(null);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  }

  const filteredCount = users.length;

  return (
    <div className={`${t.page} ${mounted ? t.mounted : ""}`}>
      <div className={t.header}>
        <span className={t.eyebrow}>// espace admin</span>
        <h1 className={t.title}>Comptes</h1>
        <p className={t.subtitle}>
          Approuvez les coachs et conseillers, bannissez ou supprimez un compte.
        </p>
      </div>

      <div className={t.filters}>
        <select className={t.select} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="all">Tous les rôles</option>
          <option value="client">Clients</option>
          <option value="coach">Coachs</option>
          <option value="advisor">Conseillers / Salles</option>
          <option value="manager">Managers</option>
          <option value="admin">Admins</option>
        </select>

        <select className={t.select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente d'approbation</option>
          <option value="approved">Approuvés</option>
          <option value="banned">Bannis</option>
        </select>

        <div className={t.searchWrap}>
          <svg className={t.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            className={t.search}
            placeholder="Rechercher par nom ou e-mail…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={t.panel}>
        {loading ? (
          <div className={t.loadingState}>
            <div className={t.spinner} />
            <p>Chargement des comptes…</p>
          </div>
        ) : error ? (
          <div className={t.errorBanner} role="alert">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className={t.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#c0c5b8" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p>Aucun compte ne correspond à ces filtres.</p>
          </div>
        ) : (
          <>
            <div className={t.resultsBar}>
              <span className={t.resultsCount}>
                {filteredCount} compte{filteredCount > 1 ? "s" : ""} trouvé{filteredCount > 1 ? "s" : ""}
              </span>
            </div>
            <div className={t.tableWrap}>
              <table className={t.table}>
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>E-mail</th>
                    <th>Rôle</th>
                    <th>Conseiller</th>
                    <th>Statut</th>
                    <th>Inscrit le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const needsApproval = u.role === "coach" || u.role === "advisor";
                    const isBanned = u.activeBans > 0;
                    const roleColor = ROLE_COLORS[u.role] || "#8b9280";
                    return (
                      <tr key={u.id}>
                        <td>
                          <div
                            className={t.userCell}
                            style={{ cursor: "pointer" }}
                            onClick={() => setProfileTarget(u)}
                            title="Voir le profil"
                          >
                            <Avatar src={u.avatarUrl} alt={`${u.firstName} ${u.lastName}`} size={40} />
                            <div className={t.userInfo}>
                              <span className={t.userName}>{u.firstName} {u.lastName}</span>
                              <span className={t.userId}>ID: {u.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className={t.mono}>{u.email}</td>
                        <td>
                          <span
                            className={t.rolePill}
                            style={{
                              backgroundColor: `${roleColor}15`,
                              color: roleColor,
                              borderColor: `${roleColor}30`
                            }}
                          >
                            {ROLE_LABELS[u.role] || u.role}
                          </span>
                        </td>
                        <td>
                          {u.role === "coach" && u.advisorName ? (
                            <span className={t.mono}>{u.advisorName}</span>
                          ) : (
                            <span className={t.muted}>—</span>
                          )}
                        </td>
                        <td>
                          <div className={t.statusWrap}>
                            {needsApproval && (
                              <span className={`${t.statusPill} ${u.isApproved ? t.statusMint : t.statusAmber}`}>
                                {u.isApproved ? "Approuvé" : "Attente"}
                              </span>
                            )}
                            {isBanned && <span className={`${t.statusPill} ${t.statusCoral}`}>Banni</span>}
                            {!needsApproval && !isBanned && <span className={t.muted}>—</span>}
                          </div>
                        </td>
                        <td className={t.mono}>{formatDate(u.createdAt)}</td>
                        <td>
                          <div className={t.actions}>
                            {needsApproval && (
                              <button
                                className={`${t.btn} ${u.isApproved ? t.btnGhost : t.btnPositive}`}
                                disabled={busyId === u.id}
                                onClick={() => toggleApprove(u)}
                                title={u.isApproved ? "Retirer l'approbation" : "Approuver"}
                              >
                                {u.isApproved ? (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                ) : (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                )}
                                <span>{u.isApproved ? "Retirer" : "Approuver"}</span>
                              </button>
                            )}
                            {isBanned ? (
                              <button
                                className={`${t.btn} ${t.btnPositive}`}
                                disabled={busyId === u.id}
                                onClick={() => unban(u)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                <span>Débannir</span>
                              </button>
                            ) : (
                              u.role !== "admin" && (
                                <button
                                  className={`${t.btn} ${t.btnDanger}`}
                                  disabled={busyId === u.id}
                                  onClick={() => setBanTarget(u)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                  <span>Bannir</span>
                                </button>
                              )
                            )}
                            {u.role !== "admin" && (
                              <button
                                className={`${t.btn} ${t.btnDanger}`}
                                disabled={busyId === u.id}
                                onClick={() => setDeleteTarget(u)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                <span>Supprimer</span>
                              </button>
                            )}
                          </div>
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

      <ProfileModal
        user={profileTarget}
        onClose={() => setProfileTarget(null)}
      />

      <BanModal
        user={banTarget}
        onClose={() => setBanTarget(null)}
        onDone={async () => {
          setBanTarget(null);
          await load();
        }}
      />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Supprimer ce compte ?">
        {deleteTarget && (
          <>
            <div className={t.deletePreview}>
              <Avatar src={deleteTarget.avatarUrl} alt={`${deleteTarget.firstName} ${deleteTarget.lastName}`} size={48} />
              <div>
                <p className={t.deleteName}>{deleteTarget.firstName} {deleteTarget.lastName}</p>
                <p className={t.deleteRole}>{ROLE_LABELS[deleteTarget.role] || deleteTarget.role}</p>
              </div>
            </div>
            <p className={t.deleteWarning}>
              Cette action supprimera définitivement le compte ainsi que ses données associées
              (réservations, avis, messages…). Cette action est irréversible.
            </p>
            <div className={t.formActions}>
              <button className={t.ghostBtn} onClick={() => setDeleteTarget(null)}>
                Annuler
              </button>
              <button className={`${t.primaryBtn} ${t.danger}`} onClick={confirmDelete}>
                Supprimer définitivement
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

function BanModal({ user, onClose, onDone }) {
  const [reason, setReason] = useState("");
  const [banType, setBanType] = useState("temporary");
  const [durationDays, setDurationDays] = useState(7);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setReason("");
      setBanType("temporary");
      setDurationDays(7);
      setError("");
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${user.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, banType, durationDays: Number(durationDays) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bannissement impossible.");
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={!!user} onClose={onClose} title={user ? `Bannir ${user.firstName} ${user.lastName}` : ""}>
      {user && (
        <div className={t.banPreview}>
          <Avatar src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} size={48} />
          <div>
            <p className={t.banName}>{user.firstName} {user.lastName}</p>
            <p className={t.banEmail}>{user.email}</p>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {error && <p className={t.formError}>{error}</p>}

        <div className={t.formGroup}>
          <label className={t.formLabel}>Type de bannissement</label>
          <select className={t.formSelect} value={banType} onChange={(e) => setBanType(e.target.value)}>
            <option value="temporary">Temporaire</option>
            <option value="permanent">Permanent</option>
          </select>
        </div>

        {banType === "temporary" && (
          <div className={t.formGroup}>
            <label className={t.formLabel}>Durée (jours)</label>
            <input
              type="number"
              min="1"
              className={t.formInput}
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
            />
          </div>
        )}

        <div className={t.formGroup}>
          <label className={t.formLabel}>Motif</label>
          <textarea
            className={t.formTextarea}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex : Fausses informations, comportement inapproprié…"
            required
          />
        </div>

        <div className={t.formActions}>
          <button type="button" className={t.ghostBtn} onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className={`${t.primaryBtn} ${t.danger}`} disabled={submitting}>
            {submitting ? "Bannissement…" : "Confirmer le bannissement"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ProfileModal({ user, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/users/${user.id}/profile`)
      .then(r => r.json())
      .then(data => {
        const normalized = {
          ...user,
          ...(data.profile || {}),
          ...data,
          reservationsCount: data.reservationsCount ?? data.stats?.reservationsCount ?? user.reservationsCount ?? 0,
          reviewsCount: data.reviewsCount ?? data.stats?.reviewsCount ?? user.reviewsCount ?? 0,
          coachesCount: data.coachesCount ?? data.stats?.coachesCount ?? user.coachesCount ?? 0,
          messagesCount: data.messagesCount ?? data.stats?.messagesCount ?? user.messagesCount ?? 0,
          certificateUrl: data.certificateUrl ?? data.profile?.certificateUrl ?? user.certificateUrl,
          price: data.price ?? data.profile?.price ?? user.price,
          specialty: data.specialty ?? data.profile?.specialty ?? user.specialty,
          bio: data.bio ?? data.profile?.bio ?? user.bio,
          phone: data.phone ?? data.profile?.phone ?? data.tel ?? data.profile?.tel ?? user.phone,
          instagramPage: data.instagramPage ?? data.profile?.instagramPage ?? data.instagram ?? user.instagramPage,
          location: data.location ?? data.profile?.location ?? user.location,
          gymLocation: data.gymLocation ?? data.profile?.gymLocation ?? user.gymLocation,
          companyName: data.companyName ?? data.profile?.companyName ?? user.companyName,
          gymName: data.gymName ?? data.profile?.gymName ?? user.gymName,
          invitationCode: data.invitationCode ?? data.profile?.invitationCode ?? user.invitationCode,
          totalInvitations: data.totalInvitations ?? data.profile?.totalInvitations ?? user.totalInvitations,
          earnedPoints: data.earnedPoints ?? data.profile?.earnedPoints ?? user.earnedPoints,
        };

        setProfile(normalized);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const roleColor = ROLE_COLORS[user.role] || "#8b9280";
  const needsApproval = user.role === "coach" || user.role === "advisor";
  const isBanned = user.activeBans > 0;

  const p = profile || user;

  const stats = [
    { label: "Réservations", value: p.reservationsCount ?? 0 },
    { label: "Avis", value: p.reviewsCount ?? 0 },
    { label: "Messages", value: p.messagesCount ?? 0 },
  ];

  if (p.role === "advisor") {
    stats.push({ label: "Coachs", value: p.coachesCount ?? 0 });
  }

  return (
    <Modal open={!!user} onClose={onClose} title={`Profil de ${user.firstName} ${user.lastName}`}>
      {loading ? (
        <div style={{ padding: 40, textAlign: "center" }}>Chargement du profil…</div>
      ) : (
        <div className={t.profileModal}>
          <div className={t.profileHeader}>
            <Avatar src={p.avatarUrl} alt={`${p.firstName} ${p.lastName}`} size={80} />
            <div className={t.profileHeaderInfo}>
              <h2 className={t.profileName}>{p.firstName} {p.lastName}</h2>
              <p className={t.profileEmail}>{p.email}</p>
              <div className={t.profileBadges}>
                <span
                  className={t.rolePill}
                  style={{
                    backgroundColor: `${roleColor}15`,
                    color: roleColor,
                    borderColor: `${roleColor}30`,
                  }}
                >
                  {ROLE_LABELS[p.role] || p.role}
                </span>
                {p.isPremium && (
                  <span className={t.statusPill} style={{ background: "#ffd70020", color: "#b8860b", borderColor: "#ffd70040" }}>
                    Premium
                  </span>
                )}
                {needsApproval && (
                  <span className={`${t.statusPill} ${p.isApproved ? t.statusMint : t.statusAmber}`}>
                    {p.isApproved ? "Approuvé" : "Attente"}
                  </span>
                )}
                {isBanned && <span className={`${t.statusPill} ${t.statusCoral}`}>Banni</span>}
              </div>
            </div>
          </div>

          <div className={t.profileDetails}>
            <DetailRow label="ID" value={p.id} />
            <DetailRow label="Genre" value={p.gender} />
            <DetailRow label="Taille" value={p.height ? `${p.height} cm` : null} />
            <DetailRow label="Inscrit le" value={formatDate(p.createdAt)} />
            <DetailRow label="Mis à jour" value={formatDate(p.updatedAt)} />
            <DetailRow label="Téléphone" value={p.phone} />
            <DetailRow label="Bio" value={p.bio} />
            <DetailRow label="Spécialité" value={p.specialty} />
            <DetailRow label="Localisation" value={p.location} />
            <DetailRow label="Salle affiliée" value={p.gymLocation} />
            <DetailRow label="Entreprise" value={p.companyName} />
            <DetailRow label="Salle" value={p.gymName} />
            {p.role === "coach" && (
              <DetailRow label="Conseiller" value={p.advisorName} />
            )}

            {p.instagramPage && (
              <DetailRow
                label="Instagram"
                value={
                  <a href={`https://instagram.com/${p.instagramPage.replace("@", "")}`} target="_blank" rel="noopener noreferrer" style={{ color: roleColor }}>
                    {p.instagramPage}
                  </a>
                }
              />
            )}

            {p.certificateUrl && (
              <DetailRow
                label="Certificat"
                value={
                  <a href={p.certificateUrl} target="_blank" rel="noopener noreferrer" style={{ color: roleColor }}>
                    Voir le certificat →
                  </a>
                }
              />
            )}

            <DetailRow label="Tarif" value={p.price ? `${p.price} €` : null} />
            <DetailRow label="Code d'invitation" value={p.invitationCode} />
            <DetailRow label="Invitations" value={p.totalInvitations} />
            <DetailRow label="Points gagnés" value={p.earnedPoints} />
          </div>

          <div className={t.profileStats}>
            {stats.map((stat) => (
              <div key={stat.label} className={t.profileStat}>
                <span className={t.profileStatValue}>{stat.value}</span>
                <span className={t.profileStatLabel}>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className={t.formActions}>
            <button className={t.ghostBtn} onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className={t.profileDetailRow}>
      <span className={t.profileDetailLabel}>{label}</span>
      <span className={t.profileDetailValue}>{value}</span>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}