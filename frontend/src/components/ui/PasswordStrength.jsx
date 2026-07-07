import { STRENGTH_LABEL } from "./passwordScore";
import styles from "./PasswordStrength.module.css";

/** PasswordStrength — segmented meter driven by a 0-4 score. */
export default function PasswordStrength({ score, visible = true }) {
  if (!visible) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.bars} role="presentation">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`${styles.bar} ${i < score ? styles[`level${score}`] : ""}`}
          />
        ))}
      </div>
      <span className={styles.label}>{STRENGTH_LABEL[score]}</span>
    </div>
  );
}
