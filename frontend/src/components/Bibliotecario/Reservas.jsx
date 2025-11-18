import { useEffect, useState } from "react";

export default function Reservas() {
  const [activas, setActivas] = useState([]);
  const [pasadas, setPasadas] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Formatear hora (08:00:00 → 08:00)
 const formatHora = (valor) => {
  if (valor == null) return "";

  if (typeof valor === "string") return valor.slice(0, 5);

  if (typeof valor === "number") {
    const horas = Math.floor(valor / 3600);
    const minutos = Math.floor((valor % 3600) / 60);
    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
  }

  const raw = Object.values(valor)[0];
  return formatHora(raw);
};



  const cargarActivas = async () => {
    try {
      const res = await fetch("http://localhost:8000/reservasActivas", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setActivas(data.reservas_activas || []);

    } catch {
      setError("Error cargando reservas activas.");
    }
  };

  const cargarPasadas = async () => {
    try {
      const res = await fetch("http://localhost:8000/reservasPasadas", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setPasadas(data.reservas_pasadas || []);

    } catch {
      setError("Error cargando reservas pasadas.");
    }
  };

  useEffect(() => {
    cargarActivas();
    cargarPasadas();

    const interval = setInterval(() => {
      cargarActivas();
      cargarPasadas();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ marginTop: 30 }}>
      <h1>Reservas</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* RESERVAS ACTIVAS */}
      <h2>Reservas Activas</h2>
      {activas.length === 0 ? (
        <p>No hay reservas activas</p>
      ) : (
        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          {activas.map((r, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: 10,
                borderRadius: 6,
                width: 250
              }}
            >
              <p><b>ID Reserva:</b> {r.id_reserva}</p>
              <p><b>Sala:</b> {r.nombre_sala}</p>
              <p><b>Edificio:</b> {r.edificio}</p>
              <p><b>Fecha:</b> {r.fecha}</p>

              {/* Hora formateada */}
              <p><b>Turno:</b> {formatHora(r.hora_inicio)} - {formatHora(r.hora_fin)}</p>

              <p><b>Estado:</b> {r.estado_reserva}</p>
            </div>
          ))}
        </div>
      )}

      {/* RESERVAS PASADAS */}
      <h2 style={{ marginTop: 40 }}>Reservas Pasadas</h2>
      {pasadas.length === 0 ? (
        <p>No hay reservas pasadas</p>
      ) : (
        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          {pasadas.map((r, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: 10,
                borderRadius: 6,
                width: 250,
                opacity: 0.7
              }}
            >
              <p><b>ID Reserva:</b> {r.id_reserva}</p>
              <p><b>Sala:</b> {r.nombre_sala}</p>
              <p><b>Edificio:</b> {r.edificio}</p>
              <p><b>Fecha:</b> {r.fecha}</p>

              {/* Hora formateada */}
              <p><b>Turno:</b> {formatHora(r.hora_inicio)} - {formatHora(r.hora_fin)}</p>

              <p><b>Estado:</b> {r.estado_reserva}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
