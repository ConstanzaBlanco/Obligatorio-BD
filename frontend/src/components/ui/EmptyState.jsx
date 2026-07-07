import styles from "./EmptyState.module.css";

/**
 * EmptyState — a designed "nothing here yet" block, not a blank screen.
 * icon (node), title, description, and an optional action.
 */
export default function EmptyState({ icon, title, description, action, className = "" }) {
  return (
    <div className={[styles.empty, className].filter(Boolean).join(" ")}>
      {icon && <div className={styles.icon} aria-hidden="true">{icon}</div>}
      {title && <p className={styles.title}>{title}</p>}
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
