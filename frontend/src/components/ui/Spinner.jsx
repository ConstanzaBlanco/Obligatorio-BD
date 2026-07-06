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
