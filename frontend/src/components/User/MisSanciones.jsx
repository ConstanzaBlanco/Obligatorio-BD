import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "../ui/Page";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import { SkeletonCard } from "../ui/Skeleton";
import { useToast } from "../ui/useToast";
import styles from "./Sanciones.module.css";

export default function MisSanciones() {
  const [activas, setActivas] = useState([]);
  const [pasadas, setPasadas] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const { error: toastError } = useToast();

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    try {
      const [datePart] = fecha.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString("es-UY", { year: "numeric", month: "long", day: "numeric" });
    } catch (e) {
      console.error("Error formateando fecha:", fecha, e);
      return fecha;
    }
  };

  const cargarActivas = async () => {
    try {
      const res = await fetch("http://localhost:8000/seeOwnActiveSanctions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.error) {
        toastError(data.error);
        return;
      }
      setActivas(data.sanciones || []);
    } catch {
      toastError("Error al cargar sanciones activas");
    }
  };

  const cargarPasadas = async () => {
    try {
      const res = await fetch("http://localhost:8000/seeOwnPastSanctions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.error) {
        toastError(data.error);
        return;
      }
      setPasadas(data.sanciones || []);
    } catch {
      toastError("Error al cargar sanciones pasadas");
    }
  };

  useEffect(() => {
    Promise.all([cargarActivas(), cargarPasadas()]).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount
  }, []);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Tu historial"
        title="Mis sanciones"
        description="Consultá tus sanciones activas y pasadas."
      />

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Sanciones activas</h2>
          <Badge variant="error" dot>{activas.length}</Badge>
        </div>
        {loading ? (
          <div className={styles.grid}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : activas.length === 0 ? (
          <EmptyState title="Sin sanciones activas" description="No tenés ninguna sanción vigente." />
        ) : (
          <div className={styles.grid}>
            {activas.map((s, i) => (
              <Card key={i} tone="warn">
                <p className={styles.desc}>{s.descripcion}</p>
                <div className={styles.dates}>
                  <span>Desde <strong>{formatFecha(s.fecha_inicio)}</strong></span>
                  <span>Hasta <strong>{formatFecha(s.fecha_fin)}</strong></span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Sanciones pasadas</h2>
          <Badge variant="neutral">{pasadas.length}</Badge>
        </div>
        {loading ? (
          <div className={styles.grid}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : pasadas.length === 0 ? (
          <EmptyState title="Sin sanciones pasadas" description="No tenés sanciones en tu historial." />
        ) : (
          <div className={styles.grid}>
            {pasadas.map((s, i) => (
              <Card key={i} tone="muted">
                <p className={styles.desc}>{s.descripcion}</p>
                <div className={styles.dates}>
                  <span>Desde <strong>{formatFecha(s.fecha_inicio)}</strong></span>
                  <span>Hasta <strong>{formatFecha(s.fecha_fin)}</strong></span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
