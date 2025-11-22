import { useEffect, useState } from "react";

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
  }, []);

  if (loading) return <p>Cargando notificaciones...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔔 Notificaciones</h2>

      <div style={styles.header}>
        <p style={styles.unreadText}>
          <strong>No leídas:</strong> {unreadCount}
        </p>
        <button style={styles.markAllButton} onClick={marcarTodas}>
          Marcar todas como leídas
        </button>
      </div>

      <div style={styles.list}>
        {notificaciones.length === 0 ? (
          <p>No tienes notificaciones.</p>
        ) : (
          notificaciones.map((n) => (
            <div
              key={n.id_notificacion}
              style={{
                ...styles.card,
                backgroundColor: n.leido ? "#ececec" : "#ffffff",
                boxShadow: n.leido
                  ? "0 2px 4px rgba(0,0,0,0.08)"
                  : "0 3px 8px rgba(0,0,0,0.15)",
                borderLeft: n.leido
                  ? "6px solid #888"
                  : "6px solid #0A3D62",
              }}
            >
              <div style={styles.cardContent}>
                <h3 style={styles.tipo}>{n.tipo.toUpperCase()}</h3>

                <p style={styles.mensaje}>{n.mensaje}</p>

                {n.referencia_tipo === "reserva" && (
                  <div style={styles.extraBox}>
                    <p><strong>Invitado por:</strong> {n.creador_nombre || "Desconocido"}</p>
                    <p><strong>Sala:</strong> {n.sala || "-"}</p>
                    <p><strong>Edificio:</strong> {n.edificio || "-"}</p>
                    <p><strong>Fecha:</strong> {n.fecha_reserva || "-"}</p>
                    <p><strong>Turno:</strong> {n.hora_inicio || "-"}</p>
                  </div>
                )}

                <small style={styles.fecha}>
                  {new Date(n.fecha).toLocaleString("es-UY")}
                </small>
              </div>

              {!n.leido && (
                <button
                  style={styles.readButton}
                  onClick={() => marcarLeida(n.id_notificacion)}
                >
                  ✔ Marcar como leída
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

//
// ESTILOS — botón abajo a la derecha
//
const styles = {
  container: {
    padding: "20px",
    maxWidth: "760px",
    margin: "0 auto",
    fontFamily: "Segoe UI, Roboto, Arial",
  },

  title: {
    fontSize: "28px",
    marginBottom: "15px",
    color: "#0A3D62",
    fontWeight: "700",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  unreadText: {
    fontSize: "16px",
  },

  markAllButton: {
    backgroundColor: "#0A3D62",
    color: "white",
    padding: "10px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  card: {
    position: "relative",   // ⭐ Necesario para ubicar el botón abajo
    padding: "18px",
    borderRadius: "12px",
    border: "1px solid #ddd",
  },

  cardContent: {
    paddingRight: "20px",
  },

  tipo: {
    margin: 0,
    marginBottom: "6px",
    fontSize: "20px",
    color: "#0A3D62",
    fontWeight: "600",
  },

  mensaje: {
    fontSize: "15px",
    marginBottom: "12px",
    color: "#333",
  },

  extraBox: {
    backgroundColor: "#e8f1ff",
    padding: "12px",
    borderRadius: "6px",
    marginTop: "12px",
    border: "1px solid #cddfff",
    fontSize: "14px",
    color: "#0A3D62",
  },

  fecha: {
    display: "block",
    marginTop: "14px",
    fontSize: "12px",
    color: "#666",
  },


  readButton: {
    position: "absolute",
    bottom: "12px",
    right: "12px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "9px 14px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },
};
