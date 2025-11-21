import { useEffect, useState } from "react";
import { useUser } from "../UserContext";

export default function Sanciones() {
  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();

  if (rol !== "bibliotecario") return null;

  const [activas, setActivas] = useState([]);
  const [pasadas, setPasadas] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [showCrearModal, setShowCrearModal] = useState(false);
  const [newCi, setNewCi] = useState("");
  const [newFechaInicio, setNewFechaInicio] = useState("");
  const [newFechaFin, setNewFechaFin] = useState("");
  const [newDescripcionTipo, setNewDescripcionTipo] = useState("");
  const [newDescripcionOtra, setNewDescripcionOtra] = useState("");
  const [loadingCrear, setLoadingCrear] = useState(false);

  const [showEditarModal, setShowEditarModal] = useState(false);
  const [editCi, setEditCi] = useState(null);
  const [editFechaInicio, setEditFechaInicio] = useState("");
  const [editFechaFin, setEditFechaFin] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [editFechaInicioOriginal, setEditFechaInicioOriginal] = useState("");
  const [editFechaFinOriginal, setEditFechaFinOriginal] = useState("");

  const token = localStorage.getItem("token");

  const cargarSancionesActivas = async () => {
    try {
      const res = await fetch("http://localhost:8000/sanctionsActive", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setActivas(data.sanciones_activas || []);
    } catch {
      alert("Error cargando sanciones activas.");
    }
  };

  const cargarSancionesPasadas = async () => {
    try {
      const res = await fetch("http://localhost:8000/sanctionsPast", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setPasadas(data.sanciones_pasadas || []);
    } catch {
      alert("Error cargando sanciones pasadas.");
    }
  };

  useEffect(() => {
    cargarSancionesActivas();
    cargarSancionesPasadas();
  }, []);

  const quitarSancion = async (ci) => {
    setMensaje("");

    try {
      const res = await fetch(`http://localhost:8000/quitarSancion?ci=${ci}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Error al quitar sanción.");
        return;
      }

      setMensaje(data.mensaje);

      await cargarSancionesActivas();
      await cargarSancionesPasadas();
    } catch {
      alert("Error al quitar la sanción.");
    }
  };

  const crearSancionManual = async (e) => {
    e.preventDefault();

    const descripcionFinal =
      newDescripcionTipo === "otro" ? newDescripcionOtra : newDescripcionTipo;

    if (!newCi || !newFechaInicio || !newFechaFin || !descripcionFinal.trim()) {
      alert("Todos los campos son obligatorios.");
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
          descripcion: descripcionFinal.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Error al crear sanción.");
        return;
      }

      setMensaje("Sanción creada correctamente.");
      setShowCrearModal(false);

      setNewCi("");
      setNewFechaInicio("");
      setNewFechaFin("");
      setNewDescripcionTipo("");
      setNewDescripcionOtra("");

      await cargarSancionesActivas();
      await cargarSancionesPasadas();
    } catch {
      alert("Error al crear la sanción.");
    } finally {
      setLoadingCrear(false);
    }
  };

  const abrirModalEditar = (s) => {
    setEditCi(s.ci_participante);
    setEditFechaInicio(s.fecha_inicio);
    setEditFechaFin(s.fecha_fin);
    setEditDesc(s.descripcion);

    setEditFechaInicioOriginal(s.fecha_inicio);
    setEditFechaFinOriginal(s.fecha_fin);

    setShowEditarModal(true);
  };

  const editarSancion = async (e) => {
    e.preventDefault();

    try {
      const body = {
        ci: editCi,
        fecha_inicio_original: editFechaInicioOriginal,
        fecha_fin_original: editFechaFinOriginal,
        nueva_fecha_inicio: editFechaInicio,
        nueva_fecha_fin: editFechaFin,
        nueva_descripcion: editDesc,
      };

      const res = await fetch("http://localhost:8000/editarSancion", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Error al editar sanción.");
        return;
      }

      setMensaje("Sanción modificada correctamente.");
      setShowEditarModal(false);

      await cargarSancionesActivas();
      await cargarSancionesPasadas();
    } catch {
      alert("Error al editar sanción.");
    }
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h1>Sanciones</h1>

      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button
          onClick={() => setShowCrearModal(true)}
          style={{
            padding: "8px 14px",
            backgroundColor: "#0d6efd",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          + Crear sanción
        </button>
      </div>

      <h2>Sanciones Activas</h2>

      <div style={contenedor}>
        {activas.map((s, i) => (
          <div key={i} style={card}>
            <p><b>CI:</b> {s.ci_participante}</p>
            <p><b>Email:</b> {s.email}</p>
            <p><b>Inicio:</b> {s.fecha_inicio}</p>
            <p><b>Fin:</b> {s.fecha_fin}</p>
            <p><b>Descripción:</b> {s.descripcion}</p>

            <button
              onClick={() => abrirModalEditar(s)}
              style={{
                marginTop: 10,
                padding: "6px 10px",
                backgroundColor: "#ffc107",
                color: "black",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                marginRight: 10,
              }}
            >
              Editar
            </button>

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
              Quitar
            </button>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 40 }}>Sanciones Pasadas</h2>
      <div style={contenedor}>
        {pasadas.map((s, i) => (
          <div key={i} style={{ ...card, opacity: 0.7 }}>
            <p><b>CI:</b> {s.ci_participante}</p>
            <p><b>Email:</b> {s.email}</p>
            <p><b>Inicio:</b> {s.fecha_inicio}</p>
            <p><b>Fin:</b> {s.fecha_fin}</p>
            <p><b>Descripción:</b> {s.descripcion}</p>
          </div>
        ))}
      </div>

      {showCrearModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Crear sanción</h3>

            <form onSubmit={crearSancionManual}>
              <div style={field}>
                <label>CI</label>
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
                <select
                  value={newDescripcionTipo}
                  onChange={(e) => setNewDescripcionTipo(e.target.value)}
                  style={input}
                >
                  <option value="">Seleccione...</option>
                  <option value="Faltar a la sala">Faltar a la sala</option>
                  <option value="Mal comportamiento">Mal comportamiento</option>
                  <option value="Uso indebido del espacio">Uso indebido del espacio</option>
                  <option value="Daños materiales">Daños materiales</option>
                  <option value="otro">Otro...</option>
                </select>
              </div>

              {newDescripcionTipo === "otro" && (
                <div style={field}>
                  <label>Motivo</label>
                  <input
                    type="text"
                    value={newDescripcionOtra}
                    onChange={(e) => setNewDescripcionOtra(e.target.value)}
                    style={input}
                  />
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowCrearModal(false)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingCrear}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#198754",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                  }}
                >
                  {loadingCrear ? "Creando..." : "Crear sanción"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditarModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Editar sanción</h3>

            <form onSubmit={editarSancion}>
              <div style={field}>
                <label>Fecha inicio</label>
                <input
                  type="date"
                  value={editFechaInicio}
                  onChange={(e) => setEditFechaInicio(e.target.value)}
                  style={input}
                />
              </div>

              <div style={field}>
                <label>Fecha fin</label>
                <input
                  type="date"
                  value={editFechaFin}
                  onChange={(e) => setEditFechaFin(e.target.value)}
                  style={input}
                />
              </div>

              <div style={field}>
                <label>Descripción</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  style={{ ...input, height: 70 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowEditarModal(false)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#0d6efd",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                  }}
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

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
