import styles from "./Badge.module.css";

/**
 * Badge / status pill.
 * variant: "neutral" | "success" | "warning" | "error" | "info" | "accent"
 * dot: show a leading status dot.
 */
export default function Badge({ variant = "neutral", dot = false, className = "", children, ...rest }) {
  const classes = [styles.badge, styles[variant], className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...rest}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
