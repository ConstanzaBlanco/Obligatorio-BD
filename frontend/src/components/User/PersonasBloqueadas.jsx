import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "../ui/Page";
import Card from "../ui/Card";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import { SkeletonCard } from "../ui/Skeleton";
import { useToast } from "../ui/useToast";
import { useConfirm } from "../ui/useConfirm";
import styles from "./Bloqueados.module.css";

export default function BlockedUsers() {
  const [bloqueados, setBloqueados] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();

  const cargarBloqueados = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/bloqueos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || data.detail || "Error al cargar bloqueos");
        setBloqueados([]);
      } else {
        setBloqueados(data.bloqueados || []);
      }
    } catch (err) {
      console.error(err);
      toastError("Error conectando con el servidor");
      setBloqueados([]);
    } finally {
      setLoading(false);
    }
  };

  const desbloquear = async (ci) => {
    const ok = await confirm({
      title: "Desbloquear usuario",
      message: `¿Desbloquear al usuario ${ci}? Volverá a poder invitarte.`,
      confirmText: "Desbloquear",
    });
    if (!ok) return;

    try {
      const res = await fetch("http://localhost:8000/bloqueos/unblock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ci_bloqueado: ci }),
      });

      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "No se pudo desbloquear");
        return;
      }

      success(data.mensaje || "Usuario desbloqueado");
      cargarBloqueados();
    } catch (err) {
      console.error(err);
      toastError("Error al desbloquear usuario");
    }
  };

  useEffect(() => {
    cargarBloqueados();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount
  }, []);

  return (
    <PageContainer size="narrow">
      <PageHeader
        eyebrow="Privacidad"
        title="Usuarios bloqueados"
        description="Personas que ya no pueden invitarte a sus reservas."
      />

      {loading ? (
        <div className={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : bloqueados.length === 0 ? (
        <EmptyState
          title="No tenés usuarios bloqueados"
          description="Cuando bloquees a alguien, aparecerá acá."
        />
      ) : (
        <div className={styles.list}>
          {bloqueados.map((b) => (
            <Card key={b.ci}>
              <div className={styles.row}>
                <div>
                  <div className={styles.name}>{b.nombre} {b.apellido}</div>
                  <div className={styles.meta}>CI {b.ci}</div>
                  <div className={styles.since}>
                    Bloqueado el {new Date(b.fecha_bloqueo).toLocaleString("es-UY")}
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => desbloquear(b.ci)}>
                  Desbloquear
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
