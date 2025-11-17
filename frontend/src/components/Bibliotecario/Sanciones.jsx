import { useEffect, useState } from "react";
import { useUser } from "../UserContext";

export default function Sanciones() {
  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();

  // SOLO bibliotecario puede ver este componente
  if (rol !== "bibliotecario") {
    return null;
  }

  const [activas, setActivas] = useState([]);
  const [pasadas, setPasadas] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Cargar sanciones activas
  const cargarSancionesActivas = async () => {
    try {
      const res = await fetch("http://localhost:8000/sanctionsActive", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setActivas(data.sanciones_activas || []);

    } catch (err) {
      setError("Error cargando sanciones activas.");
    }
  };

  // Cargar sanciones pasadas
  const cargarSancionesPasadas = async () => {
    try {
      const res = await fetch("http://localhost:8000/sanctionsPast", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setPasadas(data.sanciones_pasadas || []);

    } catch (err) {
      setError("Error cargando sanciones pasadas.");
    }
  };

  useEffect(() => {
    cargarSancionesActivas();
    cargarSancionesPasadas();
  }, []);

  return (
    <div style={{ marginTop: 30 }}>
      <h1>Sanciones</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* SANCIONES ACTIVAS */}
      <h2>Sanciones Activas</h2>
      {activas.length === 0 ? (
        <p>No hay sanciones activas</p>
      ) : (
        <div style={contenedor}>
          {activas.map((s, i) => (
            <div key={i} style={card}>
              <p><b>CI:</b> {s.ci_participante}</p>
              <p><b>Email:</b> {s.email}</p>
              <p><b>Inicio:</b> {s.fecha_inicio}</p>
              <p><b>Fin:</b> {s.fecha_fin}</p>
            </div>
          ))}
        </div>
      )}

      {/*SANCIONES PASADAS */}
      <h2 style={{ marginTop: 40 }}>Sanciones Pasadas</h2>
      {pasadas.length === 0 ? (
        <p>No hay sanciones pasadas</p>
      ) : (
        <div style={contenedor}>
          {pasadas.map((s, i) => (
            <div key={i} style={{ ...card, opacity: 0.7 }}>
              <p><b>CI:</b> {s.ci_participante}</p>
              <p><b>Email:</b> {s.email}</p>
              <p><b>Inicio:</b> {s.fecha_inicio}</p>
              <p><b>Fin:</b> {s.fecha_fin}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const contenedor = {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
  justifyContent: "center"
};

const card = {
  border: "1px solid #ccc",
  padding: 10,
  borderRadius: 6,
  width: 260
};
