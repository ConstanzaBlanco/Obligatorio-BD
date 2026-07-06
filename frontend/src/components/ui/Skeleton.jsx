import styles from "./Skeleton.module.css";

/**
 * Skeleton — shimmer placeholder for loading states.
 * variant: "line" | "block" | "circle". width/height accept any CSS length.
 */
export default function Skeleton({ variant = "line", width, height, className = "", style }) {
  return (
    <span
      className={[styles.skeleton, styles[variant], className].filter(Boolean).join(" ")}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}

/** A ready-made card-shaped skeleton for grids of loading cards. */
export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <Skeleton variant="line" width="55%" height="1.1rem" />
      <Skeleton variant="line" width="35%" />
      <Skeleton variant="block" height="2.2rem" style={{ marginTop: "var(--space-3)" }} />
    </div>
  );
}
