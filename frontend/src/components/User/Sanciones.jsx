import { useEffect, useState } from "react";

export default function Sanciones() {
  const [activas, setActivas] = useState([]);
  const [pasadas, setPasadas] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Cargar sanciones activas
  const cargarActivas = async () => {
    try {
      const res = await fetch("http://localhost:8000/seeOwnActiveSanctions", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setActivas(data.sanciones || []);
    } catch (e) {
      setError("Error al cargar sanciones activas");
    }
  };

  // Cargar sanciones pasadas
  const cargarPasadas = async () => {
    try {
      const res = await fetch("http://localhost:8000/seeOwnPastSanctions", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setPasadas(data.sanciones || []);
    } catch (e) {
      setError("Error al cargar sanciones pasadas");
    }
  };

  useEffect(() => {
    cargarActivas();
    cargarPasadas();
  }, []);

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Mis Sanciones</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}


      {/* SANCIONES ACTIVAS */}

      <h3 style={{ color: "#dc3545" }}>⛔ Sanciones Activas</h3>

      {activas.length === 0 ? (
        <p>No tenés sanciones activas</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {activas.map((s, i) => (
            <li
              key={i}
              style={{
                border: "1px solid #e74c3c",
                padding: 12,
                marginBottom: 10,
                borderRadius: 6,
                maxWidth: 400,
                margin: "auto",
                textAlign: "left"
              }}
            >
              <p><strong>Motivo:</strong> {s.motivo}</p>
              <p><strong>Fecha Inicio:</strong> {s.fecha_inicio}</p>
              <p><strong>Fecha Fin:</strong> {s.fecha_fin}</p>
            </li>
          ))}
        </ul>
      )}

     
      {/* SANCIONES PASADAS */}
      <h3 style={{ marginTop: 30, color: "#555" }}>Sanciones Pasadas</h3>

      {pasadas.length === 0 ? (
        <p>No tenés sanciones pasadas.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {pasadas.map((s, i) => (
            <li
              key={i}
              style={{
                border: "1px solid #888",
                padding: 12,
                marginBottom: 10,
                borderRadius: 6,
                maxWidth: 400,
                margin: "auto",
                textAlign: "left"
              }}
            >
              <p><strong>Motivo:</strong> {s.motivo}</p>
              <p><strong>Inicio:</strong> {s.fecha_inicio}</p>
              <p><strong>Fin:</strong> {s.fecha_fin}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
