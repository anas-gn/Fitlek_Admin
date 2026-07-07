"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

// Logo SVG Component
function Logo({ className }) {
  return (
    <svg
      className={className}
      width="40"
      height="36"
      viewBox="0 0 132 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="65.6104" cy="17.25" r="17.25" fill="#ffffff" />
      <path
        d="M5.8103 21.85C19.2827 35.9 45.0007 47.25 64.4603 47.7336M125.41 21.85C112.388 36.0329 83.709 48.212 64.4603 47.7336M64.4603 47.7336V106.95C87.8436 95.8333 128.4 73.37 103.56 72.45C78.7203 71.53 36.477 72.0666 18.4603 72.45"
        stroke="white"
        strokeWidth="16.1"
      />
    </svg>
  );
}

// Splash Screen Component
function SplashScreen() {
  return (
    <div className={styles.splash}>
      <Logo className={styles.splashLogo} />
      <span className={styles.splashText}>FITLEK</span>
      <span className={styles.splashSub}>Console Admin</span>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Hide splash after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Connexion impossible.");
        setLoading(false);
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError("Impossible de joindre le serveur.");
      setLoading(false);
    }
  }

  return (
    <>
      {showSplash && <SplashScreen />}
      
      <main className={styles.wrap}>
        <div className={styles.glow} aria-hidden="true" />
        
        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.brand}>
            <div className={styles.logoWrap}>
              <Logo />
            </div>
            <span className={styles.brandMark}>FITLEK</span>
            <span className={styles.brandSub}>Console admin</span>
          </div>

          <label className={styles.label} htmlFor="email">
            Adresse e-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@fitlek.com"
          />

          <label className={styles.label} htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>

          <p className={styles.hint}>
            Accès réservé aux comptes ayant le rôle <code>admin</code> dans la base Fitlek.
          </p>
        </form>
      </main>
    </>
  );
}