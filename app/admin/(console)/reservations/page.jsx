"use client";

import { useEffect, useState, useCallback } from "react";
import Head from "next/head";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      const res = await fetch(`/api/reservations?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur lors du chargement des réservations.");
      const data = await res.json();
      setReservations(data.reservations);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
        return {
          bg: "rgba(198, 241, 53, 0.12)",
          color: "#5a6e0a",
          border: "rgba(198, 241, 53, 0.4)",
          label: "Confirmée",
        };
      case "pending":
        return {
          bg: "rgba(255, 193, 7, 0.12)",
          color: "#8a6a00",
          border: "rgba(255, 193, 7, 0.4)",
          label: "En attente",
        };
      case "cancelled":
        return {
          bg: "rgba(255, 90, 54, 0.12)",
          color: "#b03018",
          border: "rgba(255, 90, 54, 0.4)",
          label: "Annulée",
        };
      default:
        return {
          bg: "rgba(139, 146, 128, 0.12)",
          color: "#5a6052",
          border: "rgba(139, 146, 128, 0.4)",
          label: status,
        };
    }
  };

  const getInitial = (name) => (name ? name[0].toUpperCase() : "?");

  const Avatar = ({ url, name, initial }) => {
    if (url) {
      return (
        <img
          src={url}
          alt={name}
          className="cell-avatar-img"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextElementSibling.style.display = "flex";
          }}
        />
      );
    }
    return <div className="cell-avatar-fallback">{initial}</div>;
  };

  return (
    <>
      <Head>
        <title>Réservations · Fitlek</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@500&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="page">
        <div className="header">
          <span className="eyebrow">// espace admin</span>
          <h1 className="page-title">Réservations</h1>
          <p className="subtitle">Suivi des séances réservées entre clients et coachs.</p>
        </div>

        <div className="filters">
          <select
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>

        <div className="content-card">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Chargement des réservations…</p>
            </div>
          ) : error ? (
            <div className="error-banner" role="alert">
              {error}
            </div>
          ) : reservations.length === 0 ? (
            <div className="empty-state">
              <svg
                width="80"
                height="73"
                viewBox="0 0 132 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginBottom: "24px", opacity: 0.15 }}
              >
                <circle cx="65.6104" cy="17.25" r="17.25" fill="#2a2a2a" />
                <path
                  d="M5.8103 21.85C19.2827 35.9 45.0007 47.25 64.4603 47.7336M125.41 21.85C112.388 36.0329 83.709 48.212 64.4603 47.7336M64.4603 47.7336V106.95C87.8436 95.8333 128.4 73.37 103.56 72.45C78.7203 71.53 36.477 72.0666 18.4603 72.45"
                  stroke="#2a2a2a"
                  strokeWidth="16.1"
                />
              </svg>
              <p>Aucune réservation ne correspond à ce filtre.</p>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Coach</th>
                      <th>Date</th>
                      <th>Heure</th>
                      <th>Lieu</th>
                      <th>Prix</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => {
                      const statusStyle = getStatusStyle(r.status);
                      return (
                        <tr key={r.id}>
                          <td>
                            <div className="cell-user">
                              <Avatar
                                url={r.clientAvatarUrl}
                                name={`${r.clientFirstName} ${r.clientLastName}`}
                                initial={getInitial(r.clientFirstName)}
                              />
                              <span>
                                {r.clientFirstName} {r.clientLastName}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-user">
                              <Avatar
                                url={r.coachAvatarUrl}
                                name={`${r.coachFirstName} ${r.coachLastName}`}
                                initial={getInitial(r.coachFirstName)}
                              />
                              <span>
                                {r.coachFirstName} {r.coachLastName}
                              </span>
                            </div>
                          </td>
                          <td className="mono">{formatDate(r.reservedDate)}</td>
                          <td className="mono">{r.reservedTime}</td>
                          <td>
                            {r.location || r.companyName || (
                              <span className="muted">—</span>
                            )}
                          </td>
                          <td className="mono price">
                            {Number(r.price).toFixed(0)} MAD
                          </td>
                          <td>
                            <span
                              className="status-pill"
                              style={{
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.color,
                                borderColor: statusStyle.border,
                              }}
                            >
                              {statusStyle.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="results-count">
                {reservations.length} réservation
                {reservations.length > 1 ? "s" : ""} affichée
                {reservations.length > 1 ? "s" : ""}
              </p>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        html,
        body,
        #__next {
          height: 100%;
        }
        body {
          margin: 0;
          background: #f8f9f5;
          font-family: "Inter", -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          color: #1a1a1a;
        }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 40px 48px;
          background: #f8f9f5;
        }

        .header {
          margin-bottom: 32px;
        }
        .eyebrow {
          display: block;
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #5a6e0a;
          margin-bottom: 8px;
        }
        .page-title {
          font-family: "Bebas Neue", sans-serif;
          font-size: 42px;
          letter-spacing: 0.02em;
          color: #1a1a1a;
          margin: 0;
          line-height: 1;
        }
        .subtitle {
          font-size: 13px;
          color: #8b9280;
          margin: 8px 0 0 0;
        }

        .filters {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        .select {
          background: #ffffff;
          border: 1px solid #e0e2dc;
          border-radius: 10px;
          padding: 10px 16px;
          color: #3a3a3a;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .select:hover,
        .select:focus {
          border-color: #c6f135;
        }

        .content-card {
          background: #ffffff;
          border: 1px solid #e0e2dc;
          border-radius: 16px;
          padding: 28px;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px;
          color: #8b9280;
          gap: 16px;
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 2px solid #e0e2dc;
          border-top-color: #c6f135;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .error-banner {
          background: rgba(255, 90, 54, 0.08);
          border: 1px solid rgba(255, 90, 54, 0.3);
          color: #b03018;
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 14px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px;
          color: #8b9280;
        }

        .table-wrap {
          overflow-x: auto;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .data-table thead th {
          text-align: left;
          padding: 12px 16px;
          color: #8b9280;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border-bottom: 1px solid #e0e2dc;
        }
        .data-table tbody td {
          padding: 14px 16px;
          color: #3a3a3a;
          border-bottom: 1px solid #e0e2dc;
        }
        .data-table tbody tr:hover td {
          background: rgba(198, 241, 53, 0.08);
        }
        .data-table tbody tr:last-child td {
          border-bottom: none;
        }

        .cell-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cell-avatar-img {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .cell-avatar-fallback {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #f0f1ec;
          color: #5a6052;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .mono {
          font-family: "IBM Plex Mono", monospace;
          font-size: 13px;
        }
        .price {
          color: #5a6e0a;
          font-weight: 600;
        }
        .muted {
          color: #b0b5a8;
        }

        .status-pill {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border: 1px solid;
        }

        .results-count {
          margin: 16px 0 0 0;
          color: #8b9280;
          font-size: 12px;
          font-family: "IBM Plex Mono", monospace;
        }

        @media (max-width: 900px) {
          .page {
            padding: 24px;
          }
        }
        @media (max-width: 600px) {
          .data-table {
            font-size: 12px;
          }
          .data-table thead th,
          .data-table tbody td {
            padding: 10px 12px;
          }
        }
      `}</style>
    </>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}