import { useEffect, useState } from "react";

export default function MisReservas() {
  const [activas, setActivas] = useState([]);
  const [pasadas, setPasadas] = useState([]);

  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const cargarReservas = async () => {
    try {
      // --- RESERVAS ACTIVAS ---
      const resAct = await fetch("http://localhost:8000/seeOwnActiveReservations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataAct = await resAct.json();

      if (dataAct.reservas_activas) {
        setActivas(dataAct.reservas_activas);
      } else {
        setActivas([]);
      }

      // --- RESERVAS PASADAS ---
      const resPast = await fetch("http://localhost:8000/seePastAndActiveReservations", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dataPast = await resPast.json();

      if (dataPast.reservas) {
        // filtramos las que ya pasaron
        const hoy = new Date();

        const pasadasFiltradas = dataPast.reservas.filter(r => {
          const fechaReserva = new Date(r.fecha);
          return fechaReserva < hoy || r.estado === "cancelada";
        });

        setPasadas(pasadasFiltradas);
      } else {
        setPasadas([]);
      }

    } catch (err) {
      console.error(err);
      setError("Error cargando reservas.");
    }
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  return (
    <div style={{ marginTop: 40, textAlign: "center" }}>
      <h2>Mis Reservas</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* --- RESERVAS ACTIVAS --- */}
      <h3 style={{ marginTop: 30 }}>Reservas Activas</h3>
      {activas.length === 0 && <p>No tenés reservas activas.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {activas.map((r, i) => (
          <li key={i} style={cardStyle}>
            <strong>{r.nombre_sala} - {r.edificio}</strong>
            <p>Fecha: {r.fecha}</p>
            <p>Turno: {r.id_turno}</p>
            <p>Estado: {r.estado}</p>
          </li>
        ))}
      </ul>

      {/* --- RESERVAS PASADAS --- */}
      <h3 style={{ marginTop: 40 }}>Reservas Pasadas</h3>
      {pasadas.length === 0 && <p>No tenés reservas pasadas.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {pasadas.map((r, i) => (
          <li key={i} style={cardStyle}>
            <strong>{r.nombre_sala} - {r.edificio}</strong>
            <p>Fecha: {r.fecha}</p>
            <p>Turno: {r.id_turno}</p>
            <p>Estado: {r.estado}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  padding: 12,
  borderRadius: 6,
  marginBottom: 10,
  maxWidth: 400,
  margin: "10px auto",
  textAlign: "left",
};
