import { Input } from "./Field";
import styles from "./IconInput.module.css";

/**
 * IconInput — a text Input with a leading icon and an optional trailing
 * slot (used by PasswordInput for the show/hide toggle).
 */
export default function IconInput({ icon, trailing, className = "", ...rest }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon}>{icon}</span>
      <Input
        className={[styles.input, trailing ? styles.hasTrailing : "", className].filter(Boolean).join(" ")}
        {...rest}
      />
      {trailing && <span className={styles.trailing}>{trailing}</span>}
    </div>
  );
}
