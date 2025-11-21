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

  // estado para el modal de nueva sanción
  const [showModal, setShowModal] = useState(false);
  const [newCi, setNewCi] = useState("");
  const [newFechaInicio, setNewFechaInicio] = useState("");
  const [newFechaFin, setNewFechaFin] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");
  const [loadingCrear, setLoadingCrear] = useState(false);

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

      await cargarSancionesActivas();
      await cargarSancionesPasadas();
    } catch (err) {
      setError("Error al quitar la sanción.");
    }
  };

  // --- CREAR SANCIÓN MANUAL ---
  const crearSancionManual = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!newCi || !newFechaInicio || !newFechaFin || !newDescripcion.trim()) {
      setError("Todos los campos de la nueva sanción son obligatorios.");
      return;
    }

    setLoadingCrear(true);
    try {
      const res = await fetch("http://localhost:8000/sancion/crear", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ci: Number(newCi),
          fechaInicio: newFechaInicio,
          fechaFin: newFechaFin,
          descripcion: newDescripcion.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al crear la sanción.");
        return;
      }

      setMensaje(data.status === "created" ? "Sanción creada correctamente." : "Sanción creada.");
      // limpiar formulario y cerrar modal
      setShowModal(false);
      setNewCi("");
      setNewFechaInicio("");
      setNewFechaFin("");
      setNewDescripcion("");

      // recargar listas
      await cargarSancionesActivas();
      await cargarSancionesPasadas();
    } catch (err) {
      setError("Error al crear la sanción.");
    } finally {
      setLoadingCrear(false);
    }
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h1>Sanciones</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}

      {/* Botón para abrir modal de nueva sanción */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "8px 14px",
            backgroundColor: "#0d6efd",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Agregar sanción
        </button>
      </div>

      {/* ACTIVAS */}
      <h2>Sanciones Activas</h2>
      {activas.length === 0 ? (
        <p>No hay sanciones activas</p>
      ) : (
        <div style={contenedor}>
          {activas.map((s, i) => (
            <div key={i} style={card}>
              <p>
                <b>ID:</b> {s.id_sancion}
              </p>
              <p>
                <b>Descripción:</b> {s.descripcion}
              </p>
              <p>
                <b>CI:</b> {s.ci_participante}
              </p>
              <p>
                <b>Email:</b> {s.email}
              </p>
              <p>
                <b>Inicio:</b> {s.fecha_inicio}
              </p>
              <p>
                <b>Fin:</b> {s.fecha_fin}
              </p>

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
              <p>
                <b>ID:</b> {s.id_sancion}
              </p>
              <p>
                <b>Descripción:</b> {s.descripcion}
              </p>
              <p>
                <b>CI:</b> {s.ci_participante}
              </p>
              <p>
                <b>Email:</b> {s.email}
              </p>
              <p>
                <b>Inicio:</b> {s.fecha_inicio}
              </p>
              <p>
                <b>Fin:</b> {s.fecha_fin}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NUEVA SANCIÓN */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Crear sanción manual</h3>
            <form onSubmit={crearSancionManual}>
              <div style={field}>
                <label>CI del participante</label>
                <input
                  type="number"
                  value={newCi}
                  onChange={(e) => setNewCi(e.target.value)}
                  style={input}
                />
              </div>

              <div style={field}>
                <label>Fecha inicio</label>
                <input
                  type="date"
                  value={newFechaInicio}
                  onChange={(e) => setNewFechaInicio(e.target.value)}
                  style={input}
                />
              </div>

              <div style={field}>
                <label>Fecha fin</label>
                <input
                  type="date"
                  value={newFechaFin}
                  onChange={(e) => setNewFechaFin(e.target.value)}
                  style={input}
                />
              </div>

              <div style={field}>
                <label>Descripción</label>
                <textarea
                  value={newDescripcion}
                  onChange={(e) => setNewDescripcion(e.target.value)}
                  style={{ ...input, height: 70, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                  disabled={loadingCrear}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#198754",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                  disabled={loadingCrear}
                >
                  {loadingCrear ? "Creando..." : "Crear sanción"}
                </button>
              </div>
            </form>
          </div>
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

const modalOverlay = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContent = {
  backgroundColor: "white",
  padding: 20,
  borderRadius: 8,
  minWidth: 320,
  maxWidth: 420,
  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
};

const field = {
  display: "flex",
  flexDirection: "column",
  marginBottom: 10,
};

const input = {
  padding: "6px 8px",
  borderRadius: 4,
  border: "1px solid #ccc",
  fontSize: 14,
};
