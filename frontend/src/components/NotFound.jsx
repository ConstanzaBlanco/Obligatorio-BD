import { useNavigate } from "react-router-dom";
import { PageContainer } from "./ui/Page";
import Button from "./ui/Button";
import styles from "./NotFound.module.css";

export default function NotFound({ mensaje = "Página no encontrada" }) {
  const navigate = useNavigate();

  return (
    <PageContainer size="narrow">
      <div className={styles.wrap}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>{mensaje}</h1>
        <p className={styles.description}>La página que buscás no existe o fue movida.</p>
        <Button className={styles.action} onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </div>
    </PageContainer>
  );
}
