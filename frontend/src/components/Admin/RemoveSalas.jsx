import { useEffect, useState } from "react";

export default function RemoveSalas() {
  const [salas, setSalas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const token = localStorage.getItem("token");

  // Cargar salas desde backend
  const cargarSalas = async () => {
    try {
      const res = await fetch("http://localhost:8000/salasDisponibles", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      // el endpoint devuelve "salas_disponibles"
      setSalas(data.salas_disponibles || []);
    } catch (error) {
      console.error(error);
      setMensaje("Error cargando salas.");
    }
  };

  useEffect(() => {
    cargarSalas();
  }, []);

  // Eliminar sala
  const eliminarSala = async (nombre_sala, edificio) => {
    if (!window.confirm(`¿Eliminar sala "${nombre_sala}" del edificio "${edificio}"?`)) {
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/removeSalas", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nombre_sala, edificio })
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje("Sala eliminada correctamente.");
        cargarSalas(); // refrescar la lista
      } else {
        setMensaje(data.detail || data.error || "No se pudo eliminar la sala.");
      }

    } catch (err) {
      console.error(err);
      setMensaje("Error al eliminar sala.");
    }
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Eliminar Salas</h2>
      {mensaje && <p style={{ color: "red" }}>{mensaje}</p>}

      {salas.length === 0 && <p>No hay salas registradas.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {salas.map((sala, i) => (
          <li key={i} style={cardStyle}>
            <strong>{sala.nombre_sala}</strong>
            <p><strong>Edificio:</strong> {sala.edificio}</p>
            <p><strong>Capacidad:</strong> {sala.capacidad}</p>
            <p><strong>Tipo:</strong> {sala.tipo_sala}</p>

            <button
              style={btnDelete}
              onClick={() => eliminarSala(sala.nombre_sala, sala.edificio)}
            >
              Eliminar sala
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  padding: 15,
  borderRadius: 8,
  margin: "15px auto",
  maxWidth: 420,
  backgroundColor: "#fdfdfd"
};

const btnDelete = {
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: 5,
  cursor: "pointer",
  marginTop: 10
};
