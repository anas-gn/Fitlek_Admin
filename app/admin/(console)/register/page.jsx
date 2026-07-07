"use client";

import { useEffect, useState } from "react";
import t from "./register.module.css";

export default function RegisterAdminPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Other");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, gender, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Création impossible.");

      setSuccess(`Compte admin créé pour ${firstName} ${lastName} (${email}).`);
      setFirstName("");
      setLastName("");
      setEmail("");
      setGender("Other");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${t.page} ${mounted ? t.mounted : ""}`}>
      <div className={t.header}>
        <span className={t.eyebrow}>// espace admin</span>
        <h1 className={t.title}>Nouvel administrateur</h1>
        <p className={t.subtitle}>
          Créez un compte admin supplémentaire pour la console Fitlek. Ce compte aura un accès
          complet à la modération, aux comptes et aux réservations.
        </p>
      </div>

      <div className={t.panel}>
        <form className={t.form} onSubmit={handleSubmit}>
          {error && <p className={t.formError}>{error}</p>}
          {success && <p className={t.success}>{success}</p>}

          <div className={t.row}>
            <div className={t.formGroup}>
              <label className={t.formLabel}>Prénom</label>
              <input
                className={t.formInput}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className={t.formGroup}>
              <label className={t.formLabel}>Nom</label>
              <input
                className={t.formInput}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={t.formGroup}>
            <label className={t.formLabel}>Adresse e-mail</label>
            <input
              type="email"
              className={t.formInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@fitlek.com"
              required
            />
          </div>

          <div className={t.formGroup}>
            <label className={t.formLabel}>Genre</label>
            <select className={t.formSelect} value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="Male">Homme</option>
              <option value="Female">Femme</option>
              <option value="Other">Autre / non précisé</option>
            </select>
          </div>

          <div className={t.row}>
            <div className={t.formGroup}>
              <label className={t.formLabel}>Mot de passe</label>
              <input
                type="password"
                className={t.formInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                required
              />
            </div>
            <div className={t.formGroup}>
              <label className={t.formLabel}>Confirmer le mot de passe</label>
              <input
                type="password"
                className={t.formInput}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={t.formActions}>
            <button type="submit" className={t.primaryBtn} disabled={submitting}>
              {submitting ? "Création…" : "Créer le compte admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}