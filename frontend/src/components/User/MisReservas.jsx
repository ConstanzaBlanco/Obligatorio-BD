import { useEffect, useState } from "react";
import { useUser } from "../UserContext";

export default function MisReservas() {
  const [misReservas, setMisReservas] = useState([]);
  const [inviteInputs, setInviteInputs] = useState({});
  const [reservasParticipando, setReservasParticipando] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const { user: currentUser } = useUser();

  // Convierte "2025-11-16T20:10:29" → "16/11/2025 20:10"
function formatFechaCompleta(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Pasa de "2025-11-16" → "16/11/2025"
function formatFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString("es-UY");
}

function formatHora(hora) {


  //Funcionn horrible que no pude hacer solo :(
  if (hora === null || hora === undefined || hora === "") return "";

  // Si ya es string con formato HH:MM:SS o HH:MM
  if (typeof hora === "string") {
    const parts = hora.split(":");
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return hora;
  }

  // Si es número 
  if (typeof hora === "number") {
    const h = Math.floor(hora / 3600);
    const m = Math.floor((hora % 3600) / 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // Si es un objeto 
  if (typeof hora === "object") {
    const h = hora.hour ?? hora.H ?? hora.h ?? null;
    const m = hora.minute ?? hora.min ?? hora.M ?? null;
    if (h !== null && m !== null) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    //si puede lo pasa a string
    try {
      const s = String(hora);
      if (s && typeof s === "string") return s;
    } catch (e) {
      return "";
    }
  }

  // Último recurso
  return String(hora);
}


  const cancelarReserva = async (id_reserva) => {
  const confirmacion = window.confirm("¿Seguro que querés cancelar esta reserva?");
  if (!confirmacion) return;

  try {
    const res = await fetch("http://localhost:8000/cancelarReserva", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id_reserva })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || data.error || "No se pudo cancelar la reserva.");
      return;
    }

    alert(data.mensaje);

    // Después de cancelar, recargamos las reservas activas
    cargarActivas();

  } catch (err) {
    console.error(err);
    alert("Error de conexión con el servidor");
  }
};


  const cargarActivas = async () => {
    try {
      const res = await fetch("http://localhost:8000/seeOwnActiveReservations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setMisReservas(data.mis_reservas_creadas || []);
        setReservasParticipando(data.reservas_donde_participo || []);
        // Inicializar inputs por reserva
        const init = {};
        (data.mis_reservas_creadas || []).forEach(r => {
          init[r.id_reserva] = { value: "", list: [], errors: [] };
        });
        setInviteInputs(init);
      } else {
        setError(data.detail || "Error al cargar reservas");
      }

    } catch (err) {
      console.error(err);
      setError("Error conectando con el servidor");
    }
  };

  useEffect(() => {
    cargarActivas();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Mis Reservas Activas</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {misReservas.length === 0 && reservasParticipando.length === 0 && (
        <p>No tenés reservas activas.</p>
      )}

      {misReservas.length > 0 && (
        <>
          <h3>Reservas que creaste</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {misReservas.map((r, idx) => (
              <div
                key={`creada-${r.id_reserva}`}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  padding: 16,
                  width: 260,
                  background: "#fff6f6"
                }}
              >
                <h4>{r.nombre_sala} - {r.edificio}</h4>
                <p><strong>N°:</strong> {idx + 1}</p>
                <p><strong>Hora:</strong> {formatHora(r.hora_inicio)} → {formatHora(r.hora_fin)}</p>

                {/* Input para invitar por CI */}
                <div style={{ marginTop: 10 }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="CI a invitar"
                    value={(inviteInputs[r.id_reserva] && inviteInputs[r.id_reserva].value) || ""}
                    onChange={(e) => {
                      // permitir sólo dígitos (evitar signos y letras)
                      const raw = e.target.value || "";
                      const digits = raw.replace(/\D/g, "");
                      setInviteInputs(prev => ({
                        ...prev,
                        [r.id_reserva]: { ...(prev[r.id_reserva] || { list: [], errors: [] }), value: digits }
                      }));
                    }}
                    style={{ padding: 6, width: 140, marginRight: 8 }}
                  />

                  <button
                    onClick={async () => {
                      const v = (inviteInputs[r.id_reserva] && inviteInputs[r.id_reserva].value) || "";
                      if (!v) return alert('Ingresá un CI');

                      // Evitar duplicados locales
                      const existing = (inviteInputs[r.id_reserva] && inviteInputs[r.id_reserva].list) || [];
                      if (existing.includes(Number(v))) return alert('CI ya agregado');

                      // evitar invitar al creador / a uno mismo
                      const myCi = currentUser && currentUser.ci;
                      if (myCi && Number(v) === Number(myCi)) {
                        return alert('No te podés invitar a vos salame egocéntrico');
                      }

                      try {
                        const res = await fetch(`http://localhost:8000/participante/existe/${v}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        const data = await res.json();
                        if (data.error) {
                          alert(data.error);
                          return;
                        }

                        if (data.exists) {
                          // agregar a la lista
                          setInviteInputs(prev => {
                            const cur = prev[r.id_reserva] || { value: "", list: [], errors: [] };
                            return {
                              ...prev,
                              [r.id_reserva]: { value: "", list: [...cur.list, Number(v)], errors: cur.errors }
                            };
                          });
                        } else {
                          // agregar error
                          setInviteInputs(prev => {
                            const cur = prev[r.id_reserva] || { value: "", list: [], errors: [] };
                            return {
                              ...prev,
                              [r.id_reserva]: { value: "", list: cur.list, errors: [...cur.errors, { ci: Number(v), error: 'No existe participante con ese CI' }] }
                            };
                          });
                        }

                      } catch (err) {
                        console.error(err);
                        alert('Error validando CI');
                      }
                    }}
                    style={{ padding: "8px 12px", background: "#0275d8", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
                  >Agregar</button>

                  {/* Enviar sólo si hay al menos un CI agregado */}
                  {inviteInputs[r.id_reserva] && inviteInputs[r.id_reserva].list && inviteInputs[r.id_reserva].list.length > 0 && (
                    <button
                      onClick={async () => {
                        const list = inviteInputs[r.id_reserva].list;
                        if (!list || list.length === 0) return;
                        try {
                          const res = await fetch("http://localhost:8000/invitaciones/invitar", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ id_reserva: r.id_reserva, participantes: list })
                          });
                          const data = await res.json();
                          if (!res.ok || data.error) {
                            alert(data.error || data.detail || 'Error al enviar invitaciones');
                            return;
                          }

                          alert(data.mensaje || 'Invitaciones enviadas');
                          // refrescar reservas y limpiar input
                          cargarActivas();

                        } catch (err) {
                          console.error(err);
                          alert('Error enviando invitaciones');
                        }
                      }}
                      style={{ padding: "8px 12px", marginLeft: 8, background: "#5cb85c", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
                    >Enviar</button>
                  )}

                  {/* Mostrar lista de CIs agregados */}
                  <div style={{ marginTop: 8 }}>
                    {(inviteInputs[r.id_reserva] && inviteInputs[r.id_reserva].list || []).map(ciItem => (
                      <span key={ciItem} style={{ display: 'inline-block', padding: '4px 8px', marginRight: 6, background: '#eef', borderRadius: 6 }}>{ciItem}</span>
                    ))}
                    {/* Errores */}
                    {(inviteInputs[r.id_reserva] && inviteInputs[r.id_reserva].errors || []).map(errItem => (
                      <div key={String(errItem.ci)} style={{ color: 'crimson', fontSize: 12 }}>{errItem.ci}: {errItem.error}</div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => cancelarReserva(r.id_reserva)}
                  style={{
                    marginTop: 10,
                    padding: "8px 12px",
                    background: "#d9534f",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                >Cancelar</button>
              </div>
            ))}
          </div>
        </>
      )}

      {reservasParticipando.length > 0 && (
        <>
          <h3>Reservas donde participás</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {reservasParticipando.map((r, idx) => (
              <div
                key={`part-${r.id_reserva}`}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  padding: 16,
                  width: 260,
                  background: "#f6fff6"
                }}
              >
                <h4>{r.nombre_sala} - {r.edificio}</h4>
                <p><strong>N°:</strong> {idx + 1}</p>
                <p><strong>Hora:</strong> {formatHora(r.hora_inicio)} → {formatHora(r.hora_fin)}</p>
                <p style={{ fontSize: 13, color: '#666' }}><strong>Estado invitación:</strong> {r.estado_invitacion || 'aceptada'}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
