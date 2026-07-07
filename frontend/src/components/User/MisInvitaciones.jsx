import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "../ui/Page";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import { SkeletonCard } from "../ui/Skeleton";
import { useToast } from "../ui/useToast";
import { useConfirm } from "../ui/useConfirm";
import styles from "./Invitaciones.module.css";

export default function MisInvitaciones() {
  const [invitaciones, setInvitaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();

  function formatHora(hora) {
    if (!hora) return "";
    if (typeof hora === "string") {
      const parts = hora.split(":");
      if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
      return hora;
    }
    if (typeof hora === "number") {
      const h = Math.floor(hora / 3600);
      const m = Math.floor((hora % 3600) / 60);
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    if (typeof hora === "object") {
      const h = hora.hour ?? hora.H ?? null;
      const m = hora.minute ?? hora.M ?? null;
      if (h !== null && m !== null)
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    return String(hora);
  }

  const cargarInvitaciones = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/invitaciones/pendientes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setInvitaciones(data.invitaciones || []);
      } else {
        toastError(data.error || data.detail || "Error al cargar invitaciones");
        setInvitaciones([]);
      }
    } catch {
      toastError("Error conectando con el servidor");
      setInvitaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const aceptarInvitacion = async (id_reserva) => {
    try {
      const res = await fetch("http://localhost:8000/invitaciones/aceptar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id_reserva }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "No se pudo aceptar la invitación");
        return;
      }
      success(data.mensaje || "Invitación aceptada");
      cargarInvitaciones();
    } catch {
      toastError("Error al aceptar la invitación");
    }
  };

  const rechazarInvitacion = async (id_reserva) => {
    const ok = await confirm({
      title: "Rechazar invitación",
      message: "¿Seguro que querés rechazar esta invitación?",
      confirmText: "Rechazar",
      danger: true,
    });
    if (!ok) return;

    try {
      const res = await fetch("http://localhost:8000/invitaciones/rechazar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id_reserva }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "No se pudo rechazar la invitación");
        return;
      }
      success(data.mensaje || "Invitación rechazada");
      cargarInvitaciones();
    } catch {
      toastError("Error al rechazar la invitación");
    }
  };

  const bloquearInvitacion = async (id_reserva) => {
    const ok = await confirm({
      title: "Bloquear invitaciones de esta reserva",
      message: "No recibirás más invitaciones de esta reserva.",
      confirmText: "Bloquear",
    });
    if (!ok) return;

    try {
      const res = await fetch("http://localhost:8000/invitaciones/bloquear", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id_reserva }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "No se pudo bloquear la invitación");
        return;
      }
      success(data.mensaje || "Invitaciones bloqueadas");
      cargarInvitaciones();
    } catch {
      toastError("Error al bloquear las invitaciones");
    }
  };

  const bloquearUsuario = async (ci_bloqueado) => {
    const ok = await confirm({
      title: "Bloquear usuario",
      message: "Esta persona no podrá volver a invitarte.",
      confirmText: "Bloquear usuario",
    });
    if (!ok) return;

    try {
      const res = await fetch("http://localhost:8000/bloqueos/block", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ci_bloqueado }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "No se pudo bloquear al usuario");
        return;
      }
      success(data.mensaje || "Usuario bloqueado");
      cargarInvitaciones();
    } catch {
      toastError("Error al bloquear usuario");
    }
  };

  useEffect(() => {
    cargarInvitaciones();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount
  }, []);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Invitaciones"
        title="Mis invitaciones"
        description="Respondé las invitaciones a reservas de otras personas."
      />

      {loading ? (
        <div className={styles.grid}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : invitaciones.length === 0 ? (
        <EmptyState
          title="No tenés invitaciones pendientes"
          description="Cuando alguien te invite a una reserva, la vas a ver acá."
        />
      ) : (
        <div className={styles.grid}>
          {invitaciones.map((inv) => {
            const cancelada = inv.estado === "cancelada";
            return (
              <Card key={`${inv.id_reserva}-${inv.ci_participante}`} tone={cancelada ? "muted" : "ok"}>
                <div className={styles.head}>
                  <span className={styles.room}>{inv.nombre_sala} · {inv.edificio}</span>
                  <Badge variant={cancelada ? "error" : "success"} dot>
                    {cancelada ? "Cancelada" : "Activa"}
                  </Badge>
                </div>

                <div className={styles.meta}>
                  <span>{formatHora(inv.hora_inicio)} → {formatHora(inv.hora_fin)}</span>
                  <span>De <strong>{inv.creador_nombre} {inv.creador_apellido}</strong></span>
                </div>

                <div className={styles.actions}>
                  <div className={styles.actionsRow}>
                    <Button size="sm" onClick={() => aceptarInvitacion(inv.id_reserva)} disabled={cancelada}>
                      Aceptar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => rechazarInvitacion(inv.id_reserva)} disabled={cancelada}>
                      Rechazar
                    </Button>
                  </div>
                  <div className={styles.actionsRow}>
                    <Button variant="secondary" size="sm" onClick={() => bloquearInvitacion(inv.id_reserva)} disabled={cancelada}>
                      Bloquear reserva
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => bloquearUsuario(inv.creador)}>
                      Bloquear usuario
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
