import styles from "./Button.module.css";

/**
 * Button — the single button primitive for the app.
 *
 * variant: "primary" | "secondary" | "danger" | "success" | "ghost"
 * size:    "sm" | "md"
 * Also forwards type, disabled, onClick, aria-*, etc.
 */
export default function Button({
  variant = "primary",
  size = "md",
  type = "button",
  fullWidth = false,
  leadingIcon,
  className = "",
  children,
  ...rest
}) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.full : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {leadingIcon && <span className={styles.icon} aria-hidden="true">{leadingIcon}</span>}
      {children}
    </button>
  );
}
