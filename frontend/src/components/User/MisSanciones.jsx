import { useEffect, useState } from "react";

export default function MisSanciones() {
  const [activas, setActivas] = useState([]);
  const [pasadas, setPasadas] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  
  const formatFecha = (fecha) => {
    if (!fecha) return "";

    try {
      // Soportar tanto "YYYY-MM-DD" como "YYYY-MM-DDTHH:mm:ss"
      const [datePart] = fecha.split("T");
      const [year, month, day] = datePart.split("-").map(Number);

      const dateObj = new Date(year, month - 1, day); 

      return dateObj.toLocaleDateString("es-UY", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formateando fecha:", fecha, e);
      return fecha;
    }
  };

  const cargarActivas = async () => {
    try {
      const res = await fetch("http://localhost:8000/seeOwnActiveSanctions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setActivas(data.sanciones || []);
    } catch (e) {
      setError("Error al cargar sanciones activas");
    }
  };

  const cargarPasadas = async () => {
    try {
      const res = await fetch("http://localhost:8000/seeOwnPastSanctions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setPasadas(data.sanciones || []);
    } catch (e) {
      setError("Error al cargar sanciones pasadas");
    }
  };

  // Cargar al montar
  useEffect(() => {
    cargarActivas();
    cargarPasadas();
  }, []);

  return (
    <div style={{ marginTop: 30 }}>
      <h2 style={{ textAlign: "center" }}>Mis Sanciones</h2>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <h3 style={{ color: "#dc3545", textAlign: "center" }}>⛔ Sanciones Activas</h3>

      {activas.length === 0 ? (
        <p style={{ textAlign: "center" }}>No tenés sanciones activas</p>
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
                textAlign: "left",
                background: "#fdecea",
              }}
            >
              <p><strong>Descripcion:</strong> {(s.descripcion)}</p>
              <p><strong>Fecha Inicio:</strong> {formatFecha(s.fecha_inicio)}</p>
              <p><strong>Fecha Fin:</strong> {formatFecha(s.fecha_fin)}</p>
            </li>
          ))}
        </ul>
      )}

      <h3 style={{ marginTop: 30, color: "#555", textAlign: "center" }}>
        🕒 Sanciones Pasadas
      </h3>

      {pasadas.length === 0 ? (
        <p style={{ textAlign: "center" }}>No tenés sanciones pasadas.</p>
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
                textAlign: "left",
                background: "#f4f4f4",
              }}
            >
              <p><strong>Descripcion:</strong> {(s.descripcion)}</p>
              <p><strong>Inicio:</strong> {formatFecha(s.fecha_inicio)}</p>
              <p><strong>Fin:</strong> {formatFecha(s.fecha_fin)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
