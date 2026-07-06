import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "../ui/Page";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import { SkeletonCard } from "../ui/Skeleton";
import styles from "./Notificaciones.module.css";

export default function NotificationsPanel() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem("token");

  const fetchNotificaciones = async () => {
    try {
      const res = await fetch("http://localhost:8000/notificaciones/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotificaciones(data.notificaciones || []);
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
    }
  };

  const fetchUnread = async () => {
    try {
      const res = await fetch("http://localhost:8000/notificaciones/sinLeer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUnreadCount(data.unread || 0);
    } catch (err) {
      console.error("Error cargando sin leer:", err);
    }
  };

  const marcarLeida = async (id) => {
    try {
      await fetch(`http://localhost:8000/notificaciones/marcarLeida/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotificaciones();
      fetchUnread();
    } catch (err) {
      console.error("Error marcando como leída:", err);
    }
  };

  const marcarTodas = async () => {
    try {
      await fetch("http://localhost:8000/notificaciones/marcarTodasLeidas", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotificaciones();
      fetchUnread();
    } catch (err) {
      console.error("Error marcando todas:", err);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchNotificaciones();
      await fetchUnread();
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount
  }, []);

  return (
    <PageContainer size="narrow">
      <PageHeader
        eyebrow="Actividad"
        title="Notificaciones"
        description="Avisos sobre tus reservas, invitaciones y sanciones."
        actions={
          notificaciones.length > 0 && (
            <Button variant="secondary" onClick={marcarTodas}>
              Marcar todas como leídas
            </Button>
          )
        }
      />

      {!loading && (
        <div className={styles.summary}>
          <Badge variant={unreadCount > 0 ? "info" : "neutral"} dot>
            {unreadCount} sin leer
          </Badge>
        </div>
      )}

      {loading ? (
        <div className={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : notificaciones.length === 0 ? (
        <EmptyState title="Estás al día" description="No tenés notificaciones por ahora." />
      ) : (
        <div className={styles.list}>
          {notificaciones.map((n) => (
            <Card
              key={n.id_notificacion}
              tone={n.leido ? "muted" : undefined}
              className={n.leido ? styles.read : styles.unread}
            >
              <div className={styles.head}>
                <span className={styles.tipo}>{n.tipo}</span>
                {!n.leido && <Badge variant="info" dot>Nueva</Badge>}
              </div>

              <p className={styles.mensaje}>{n.mensaje}</p>

              {n.referencia_tipo === "reserva" && (
                <div className={styles.extra}>
                  <span>Invitado por <strong>{n.creador_nombre || "Desconocido"}</strong></span>
                  <span>Sala <strong>{n.sala || "-"}</strong> · {n.edificio || "-"}</span>
                  <span>{n.fecha_reserva || "-"} · {n.hora_inicio || "-"}</span>
                </div>
              )}

              <div className={styles.foot}>
                <span className={styles.fecha}>{new Date(n.fecha).toLocaleString("es-UY")}</span>
                {!n.leido && (
                  <Button size="sm" variant="ghost" onClick={() => marcarLeida(n.id_notificacion)}>
                    Marcar como leída
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
