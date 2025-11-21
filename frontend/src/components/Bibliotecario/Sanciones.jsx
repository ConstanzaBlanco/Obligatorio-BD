import { useEffect, useState } from "react";
import { useUser } from "../UserContext";

/* ========================================================
   ALERT COMPONENTE
======================================================== */
function Alert({ type = "error", message, onClose }) {
  const colors = {
    error: "#dc3545",
    success: "#198754",
    warning: "#ffc107",
    info: "#0dcaf0",
  };

  return (
    <div
      style={{
        background: colors[type] + "22",
        border: "1px solid " + colors[type],
        padding: "10px 14px",
        borderRadius: 6,
        color: colors[type],
        marginBottom: 15,
        position: "relative",
      }}
    >
      <strong style={{ textTransform: "capitalize" }}>{type}:</strong>{" "}
      {message}

      <button
        onClick={onClose}
        style={{
          position: "absolute",
          right: 10,
          top: 8,
          background: "transparent",
          border: "none",
          color: colors[type],
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
}

/* ========================================================
   COMPONENTE PRINCIPAL — SANCIONES
======================================================== */
export default function Sanciones() {
  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();

  if (rol !== "bibliotecario") return null;

  const [activas, setActivas] = useState([]);
  const [pasadas, setPasadas] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const token = localStorage.getItem("token");

  // --- MODAL CREAR ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCi, setNewCi] = useState("");
  const [newFechaInicio, setNewFechaInicio] = useState("");
  const [newFechaFin, setNewFechaFin] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");
  const [loadingCrear, setLoadingCrear] = useState(false);

  // --- MODAL EDITAR ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    ci: "",
    fecha_inicio_original: "",
    fecha_fin_original: "",
    nueva_fecha_inicio: "",
    nueva_fecha_fin: "",
    nueva_descripcion: "",
  });

  // --- FETCH ACTIVES ---
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

  // --- FETCH PAST ---
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
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.detail || "Error al quitar sanción.");
      }

      setMensaje(data.mensaje || "Sanción quitada.");
      await cargarSancionesActivas();
      await cargarSancionesPasadas();
    } catch {
      setError("Error al quitar la sanción.");
    }
  };

  // --- CREAR SANCIÓN ---
  const crearSancionManual = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!newCi || !newFechaInicio || !newFechaFin || !newDescripcion.trim()) {
      setError("Todos los campos son obligatorios.");
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
        return setError(data.detail || "Error al crear sanción.");
      }

      setMensaje("Sanción creada correctamente.");
      setShowCreateModal(false);

      setNewCi("");
      setNewFechaInicio("");
      setNewFechaFin("");
      setNewDescripcion("");

      await cargarSancionesActivas();
      await cargarSancionesPasadas();
    } finally {
      setLoadingCrear(false);
    }
  };

  // --- EDITAR SANCIÓN ---
  const abrirModalEditar = (s) => {
    setEditData({
      ci: s.ci_participante,
      fecha_inicio_original: s.fecha_inicio,
      fecha_fin_original: s.fecha_fin,
      nueva_fecha_inicio: s.fecha_inicio,
      nueva_fecha_fin: s.fecha_fin,
      nueva_descripcion: s.descripcion,
    });
    setShowEditModal(true);
  };

  const editarSancion = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      const res = await fetch("http://localhost:8000/editarSancion", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.detail || "Error al editar sanción.");
      }

      setMensaje("Sanción editada correctamente.");
      setShowEditModal(false);

      await cargarSancionesActivas();
      await cargarSancionesPasadas();
    } catch {
      setError("No se pudo editar la sanción.");
    }
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h1>Sanciones</h1>

      {/* ========================================================
         ALERTS — NUEVO
      ======================================================= */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      {mensaje && (
        <Alert
          type="success"
          message={mensaje}
          onClose={() => setMensaje("")}
        />
      )}

      {/* ---------------------------------- */}
      {/* BOTÓN CREAR */}
      {/* ---------------------------------- */}
      <button onClick={() => setShowCreateModal(true)} style={btnPrimary}>
        Agregar sanción
      </button>

      {/* ---------------------------------- */}
      {/* SANCIONES ACTIVAS */}
      {/* ---------------------------------- */}
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
                <b>CI:</b> {s.ci_participante}
              </p>
              <p>
                <b>Email:</b> {s.email}
              </p>
              <p>
                <b>Descripción:</b> {s.descripcion}
              </p>
              <p>
                <b>Inicio:</b> {s.fecha_inicio}
              </p>
              <p>
                <b>Fin:</b> {s.fecha_fin}
              </p>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button style={btnEdit} onClick={() => abrirModalEditar(s)}>
                  Editar
                </button>

                <button
                  style={btnDanger}
                  onClick={() => quitarSancion(s.ci_participante)}
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------------- */}
      {/* SANCIONES PASADAS */}
      {/* ---------------------------------- */}
      <h2 style={{ marginTop: 40 }}>Sanciones Pasadas</h2>
      {pasadas.length === 0 ? (
        <p>No hay sanciones pasadas</p>
      ) : (
        <div style={contenedor}>
          {pasadas.map((s, i) => (
            <div key={i} style={{ ...card, opacity: 0.6 }}>
              <p>
                <b>ID:</b> {s.id_sancion}
              </p>
              <p>
                <b>CI:</b> {s.ci_participante}
              </p>
              <p>
                <b>Email:</b> {s.email}
              </p>
              <p>
                <b>Descripción:</b> {s.descripcion}
              </p>
              <p>
                <b>Inicio:</b> {s.fecha_inicio}
              </p>
              <p>
                <b>Fin:</b> {s.fecha_fin}
              </p>

              <button style={{ ...btnEdit, background: "#6c757d" }} disabled>
                Editar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------------- */}
      {/* MODAL CREAR SANCIÓN */}
      {/* ---------------------------------- */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <h3>Nueva sanción</h3>

          <form onSubmit={crearSancionManual}>
            <Input label="CI" value={newCi} onChange={setNewCi} />
            <Input
              label="Fecha inicio"
              type="date"
              value={newFechaInicio}
              onChange={setNewFechaInicio}
            />
            <Input
              label="Fecha fin"
              type="date"
              value={newFechaFin}
              onChange={setNewFechaFin}
            />
            <Textarea
              label="Descripción"
              value={newDescripcion}
              onChange={setNewDescripcion}
            />

            <div style={modalButtons}>
              <button
                type="button"
                style={btnSecondary}
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </button>
              <button type="submit" style={btnSuccess} disabled={loadingCrear}>
                {loadingCrear ? "Creando..." : "Crear"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------------------------------- */}
      {/* MODAL EDITAR SANCIÓN */}
      {/* ---------------------------------- */}
      {showEditModal && (
        <Modal onClose={() => setShowEditModal(false)}>
          <h3>Editar sanción</h3>

          <form onSubmit={editarSancion}>
            <p>
              <b>CI:</b> {editData.ci}
            </p>

            <Input
              label="Nueva fecha inicio"
              type="date"
              value={editData.nueva_fecha_inicio}
              onChange={(v) =>
                setEditData({ ...editData, nueva_fecha_inicio: v })
              }
            />

            <Input
              label="Nueva fecha fin"
              type="date"
              value={editData.nueva_fecha_fin}
              onChange={(v) =>
                setEditData({ ...editData, nueva_fecha_fin: v })
              }
            />

            <Textarea
              label="Nueva descripción"
              value={editData.nueva_descripcion}
              onChange={(v) =>
                setEditData({ ...editData, nueva_descripcion: v })
              }
            />

            <div style={modalButtons}>
              <button
                type="button"
                style={btnSecondary}
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </button>
              <button type="submit" style={btnSuccess}>
                Guardar cambios
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------
   COMPONENTES REUTILIZABLES
---------------------------------------------- */
function Modal({ children, onClose }) {
  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        {children}

        <button onClick={onClose} style={closeButton}>
          ✕
        </button>
      </div>
    </div>
  );
}

function Input({ label, type = "text", value, onChange }) {
  return (
    <div style={field}>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={input}
      />
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div style={field}>
      <label>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...input, height: 80 }}
      />
    </div>
  );
}

/* ---------------------------------------------
        ESTILOS
---------------------------------------------- */

const contenedor = {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
  justifyContent: "center",
};

const card = {
  border: "1px solid #ccc",
  padding: 12,
  borderRadius: 6,
  width: 280,
  background: "white",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const btnPrimary = {
  padding: "8px 14px",
  background: "#0d6efd",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  marginBottom: 20,
};

const btnEdit = {
  padding: "6px 12px",
  background: "#198754",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const btnDanger = {
  padding: "6px 12px",
  background: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const btnSecondary = {
  padding: "6px 12px",
  background: "#6c757d",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const btnSuccess = {
  padding: "6px 12px",
  background: "#28a745",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
};

const modalContent = {
  background: "white",
  padding: 20,
  borderRadius: 8,
  minWidth: 350,
  maxWidth: 450,
  position: "relative",
};

const closeButton = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "transparent",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
};

const modalButtons = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 15,
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
