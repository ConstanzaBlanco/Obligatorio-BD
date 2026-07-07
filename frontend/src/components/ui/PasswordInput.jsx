import { useState } from "react";
import IconInput from "./IconInput";
import { LockIcon, EyeIcon, EyeOffIcon } from "./icons";
import styles from "./IconInput.module.css";

/** PasswordInput — IconInput preset with a lock icon and a show/hide toggle. */
export default function PasswordInput(props) {
  const [visible, setVisible] = useState(false);

  return (
    <IconInput
      icon={<LockIcon />}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
      {...props}
    />
  );
}
