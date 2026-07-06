import styles from "./Spinner.module.css";

/** Spinner — inline loading indicator. size in px. label for a11y. */
export default function Spinner({ size = 20, label = "Cargando", className = "" }) {
  return (
    <span
      className={[styles.spinner, className].filter(Boolean).join(" ")}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    />
  );
}

/** PageSpinner — centered loading state for a full route/page, optionally with a caption. */
export function PageSpinner({ label, size = 28 }) {
  return (
    <div className={styles.pageSpinner}>
      <Spinner size={size} />
      {label && <p>{label}</p>}
    </div>
  );
}
