import { useEffect, useState } from "react";
import { useUser } from "../UserContext";

export default function Sanciones() {
  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();

  // SOLO bibliotecario
  if (rol !== "bibliotecario") return null;

  const [activas, setActivas] = useState([]);
  const [pasadas, setPasadas] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const token = localStorage.getItem("token");

  // --- CARGAR SANCIONES ACTIVAS ---
  const cargarSancionesActivas = async () => {
    try {
      const res = await fetch("http://localhost:8000/sanctionsActive", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setActivas(data.sanciones_activas || []);
    } catch {
      setError("Error cargando sanciones activas.");
    }
  };

  // --- CARGAR SANCIONES PASADAS ---
  const cargarSancionesPasadas = async () => {
    try {
      const res = await fetch("http://localhost:8000/sanctionsPast", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setPasadas(data.sanciones_pasadas || []);
    } catch {
      setError("Error cargando sanciones pasadas.");
    }
  };

  useEffect(() => {
    cargarSancionesActivas();
    cargarSancionesPasadas();
  }, []);

  // --- QUITAR SANCIÓN ---
  const quitarSancion = async (ci) => {
  setMensaje("");
  setError("");

  try {
    const res = await fetch(`http://localhost:8000/quitarSancion?ci=${ci}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.detail || "Error al quitar sanción.");
      return;
    }

    setMensaje(data.mensaje || "Sanción quitada.");

    // RECARGA OBLIGATORIA
    await cargarSancionesActivas();
    await cargarSancionesPasadas();

    console.log("Sanciones recargadas correctamente.");

  } catch (err) {
    setError("Error al quitar la sanción.");
  }
};



  return (
    <div style={{ marginTop: 30 }}>
      <h1>Sanciones</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}

      {/* ACTIVAS */}
      <h2>Sanciones Activas</h2>
      {activas.length === 0 ? (
        <p>No hay sanciones activas</p>
      ) : (
        <div style={contenedor}>
          {activas.map((s, i) => (
            <div key={i} style={card}>
              <p><b>ID:</b> {s.id_sancion}</p>
              <p><b>CI:</b> {s.ci_participante}</p>
              <p><b>Email:</b> {s.email}</p>
              <p><b>Inicio:</b> {s.fecha_inicio}</p>
              <p><b>Fin:</b> {s.fecha_fin}</p>

              <button
                onClick={() => quitarSancion(s.ci_participante)}
                style={{
                  marginTop: 10,
                  padding: "6px 10px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Quitar sanción
              </button>
            </div>
          ))}
        </div>
      )}

      {/* PASADAS */}
      <h2 style={{ marginTop: 40 }}>Sanciones Pasadas</h2>
      {pasadas.length === 0 ? (
        <p>No hay sanciones pasadas</p>
      ) : (
        <div style={contenedor}>
          {pasadas.map((s, i) => (
            <div key={i} style={{ ...card, opacity: 0.7 }}>
              <p><b>ID:</b> {s.id_sancion}</p>
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

// estilos
const contenedor = {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
  justifyContent: "center",
};

const card = {
  border: "1px solid #ccc",
  padding: 10,
  borderRadius: 6,
  width: 280,
};
