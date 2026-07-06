import styles from "./Page.module.css";

/**
 * PageContainer — centered max-width column with consistent page padding.
 * `size`: "default" | "narrow" (for forms/profile) | "wide".
 */
export function PageContainer({ size = "default", className = "", children, ...rest }) {
  return (
    <div className={[styles.container, styles[size], className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}

/**
 * PageHeader — the H1 row every page opens with: eyebrow, title, description,
 * and an optional actions slot on the right.
 */
export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className={styles.header}>
      <div className={styles.headingGroup}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
