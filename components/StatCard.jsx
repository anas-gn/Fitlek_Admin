import styles from "./StatCard.module.css";

export default function StatCard({ label, value, sub, accent = "brass" }) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.value} ${styles[accent] || ""}`}>{value}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </div>
  );
}
