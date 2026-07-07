import { CheckIcon } from "./ui/icons";
import styles from "../styles/Auth.module.css";

const FEATURES = [
  "Reservá salas de estudio en segundos",
  "Invitá compañeros y seguí tus reservas",
  "Un acceso para usuarios, bibliotecarios y administradores",
];

/** AuthLayout — the split-screen shell shared by Login and Register. */
export default function AuthLayout({ children }) {
  return (
    <div className={styles.screen}>
      <div className={styles.brandPanel}>
        <div className={styles.brandGlow} aria-hidden="true" />

        <div className={styles.brandTop}>
          <span className={styles.brandMark}>B</span>
          <div>
            <div className={styles.brandTitle}>Salas · Biblioteca</div>
            <div className={styles.brandTagline}>Sistema de reservas para bibliotecas universitarias</div>
          </div>
        </div>

        <ul className={styles.brandFeatures}>
          {FEATURES.map((f) => (
            <li key={f}>
              <CheckIcon className={styles.brandFeatureIcon} />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <p className={styles.brandFootnote}>Hecho para bibliotecas universitarias.</p>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formInner}>{children}</div>
      </div>
    </div>
  );
}
