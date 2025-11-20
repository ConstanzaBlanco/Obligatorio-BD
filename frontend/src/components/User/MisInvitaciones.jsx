import { useEffect, useState } from "react";
import "./MisInvitaciones.css";

export default function MisInvitaciones() {
  const [invitaciones, setInvitaciones] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-UY");
  };

  const formatHora = (hora) => {
    if (!hora) return "";
    if (typeof hora === "string") {
      const parts = hora.split(":");
      return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : hora;
    }
    return String(hora);
  };

  const cargarInvitaciones = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/invitaciones/pendientes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setInvitaciones(data.invitaciones || []);
        setError("");
      } else {
        setError(data.error || data.detail || "Error al cargar invitaciones");
        setInvitaciones([]);
      }
    } catch (err) {
      console.error(err);
      setError("Error conectando con el servidor");
      setInvitaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const aceptarInvitacion = async (id_reserva) => {
    try {
      const res = await fetch("http://localhost:8000/invitaciones/aceptar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_reserva }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo aceptar la invitación");
        return;
      }

      alert("✓ Invitación aceptada");
      cargarInvitaciones();
    } catch (err) {
      console.error(err);
      alert("Error al aceptar la invitación");
    }
  };

  const rechazarInvitacion = async (id_reserva) => {
    if (!window.confirm("¿Estás seguro de que querés rechazar esta invitación?")) return;

    try {
      const res = await fetch("http://localhost:8000/invitaciones/rechazar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_reserva }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo rechazar la invitación");
        return;
      }

      alert("✗ Invitación rechazada");
      cargarInvitaciones();
    } catch (err) {
      console.error(err);
      alert("Error al rechazar la invitación");
    }
  };

  useEffect(() => {
    cargarInvitaciones();
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Mis Invitaciones</h1>
        <p className="subtitle">Recibiste {invitaciones.length} invitación(es) pendiente(s)</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Cargando invitaciones...</p>
        </div>
      )}

      {!loading && invitaciones.length === 0 && (
        <div className="empty-state">
          <p>📭 No tenés invitaciones pendientes</p>
        </div>
      )}

      <div className="grid">
        {invitaciones.map((inv) => (
          <div
            key={`${inv.id_reserva}-${inv.ci_participante}`}
            className="card invitation-card"
          >
            <div className="invitation-header">
              <div className="from-user">
                <span className="from-icon">📨</span>
                <div>
                  <span className="from-label">De:</span>
                  <p className="from-name">
                    {inv.creador_nombre} {inv.creador_apellido}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-body">
              <h3 className="room-name">{inv.nombre_sala}</h3>
              <p className="building-name">{inv.edificio}</p>

              <div className="info-row">
                <span className="info-label">📅</span>
                <span className="info-value">{formatFecha(inv.fecha)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">⏰</span>
                <span className="info-value">
                  {formatHora(inv.hora_inicio)} → {formatHora(inv.hora_fin)}
                </span>
              </div>
            </div>

            <div className="invitation-actions">
              <button
                onClick={() => aceptarInvitacion(inv.id_reserva)}
                className="btn btn-success btn-block"
              >
                ✓ Aceptar
              </button>
              <button
                onClick={() => rechazarInvitacion(inv.id_reserva)}
                className="btn btn-danger btn-block"
              >
                ✗ Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
