import styles from "./Card.module.css";

/**
 * Card — surface container. `as` lets it render as a section/article/li.
 * `tone` adds a subtle left status accent: "ok" | "warn" | "muted".
 * `interactive` adds hover elevation (use for clickable cards).
 */
export default function Card({
  as: Tag = "div",
  tone,
  interactive = false,
  className = "",
  children,
  ...rest
}) {
  const classes = [
    styles.card,
    tone ? styles[`tone-${tone}`] : "",
    interactive ? styles.interactive : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className={styles.header}>
      <div className={styles.headingGroup}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
