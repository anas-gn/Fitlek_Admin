import styles from "./Badge.module.css";

const TONE_MAP = {
  pending: "amber",
  confirmed: "mint",
  cancelled: "coral",
  approved: "mint",
  banned: "coral",
  active: "coral",
  lifted: "muted",
  client: "muted",
  coach: "brass",
  advisor: "mint",
  admin: "coral",
  manager: "amber"
};

export default function Badge({ children, tone }) {
  const resolvedTone = tone || TONE_MAP[String(children).toLowerCase()] || "muted";
  return <span className={`${styles.badge} ${styles[resolvedTone] || styles.muted}`}>{children}</span>;
}