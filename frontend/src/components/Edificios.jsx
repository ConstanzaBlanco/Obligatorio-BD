import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "./UserContext";

export default function Edificios() {
  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();

  const [edificios, setEdificios] = useState([]);
  const [departamentoFiltro, setDepartamentoFiltro] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [mensaje, setMensaje] = useState("");

  //  CREAR EDIFICIO (FORM) 
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDireccion, setNuevaDireccion] = useState("");
  const [nuevoDepartamento, setNuevoDepartamento] = useState("");
  const [idFacultad, setIdFacultad] = useState("");

  // MODAL 
  const [showModal, setShowModal] = useState(false);
  const [edificioAEditar, setEdificioAEditar] = useState(null);

  const [editIdFacultad, setEditIdFacultad] = useState("");
  const [editHabilitado, setEditHabilitado] = useState("");

  const guardarCambios = async () => {
    const token = localStorage.getItem("token");

    const body = {
      nombre_original: edificioAEditar.nombre_edificio,
    };

    if (editIdFacultad !== "") {
      body.id_facultad = parseInt(editIdFacultad);
    }
    if (editHabilitado !== "") {
      body.habilitado = editHabilitado === "true";
    }

    try {
      const res = await fetch("http://localhost:8000/editarEdificio", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.detail || "Error al editar edificio.");
        return;
      }

      setMensaje("Edificio actualizado correctamente.");
      setShowModal(false);
      cargarEdificios();
    } catch {
      setMensaje("Error al editar edificio.");
    }
  };

  // Cargar departamentos
  const cargarDepartamentos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/departamentos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDepartamentos(Array.isArray(data.departamentos) ? data.departamentos : []);
    } catch {}
  };

  // Cargar facultades
  const cargarFacultades = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/facultad/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFacultades(data || []);
    } catch {}
  };

  // Cargar edificios
  const cargarEdificios = async () => {
    try {
      const token = localStorage.getItem("token");

      let url = "http://localhost:8000/edificios";
      if (departamentoFiltro) url += `?departamento=${departamentoFiltro}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setEdificios(data.edificios || []);
      setMensaje("");
    } catch {
      setMensaje("Error cargando edificios.");
    }
  };

  useEffect(() => {
    cargarDepartamentos();
    cargarFacultades();
    cargarEdificios();
  }, []);

  useEffect(() => {
    cargarEdificios();
  }, [departamentoFiltro]);

  // ELIMINAR (ADMIN)
  const eliminarEdificio = async (nombre_edificio) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${nombre_edificio}"?`)) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:8000/eliminarEdificio/${encodeURIComponent(nombre_edificio)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMensaje(data.detail || "No se pudo eliminar el edificio.");
        return;
      }

      setMensaje("Edificio eliminado correctamente.");
      cargarEdificios();
    } catch {
      setMensaje("Error eliminando edificio.");
    }
  };

  // CREAR (ADMIN)
  const crearEdificio = async (e) => {
    e.preventDefault();
    setMensaje("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/crearEdificio", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre_edificio: nuevoNombre,
          direccion: nuevaDireccion,
          departamento: nuevoDepartamento,
          id_facultad: parseInt(idFacultad),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.detail || "Error creando edificio.");
        return;
      }

      setMensaje("Edificio creado correctamente.");
      setNuevoNombre("");
      setNuevaDireccion("");
      setNuevoDepartamento("");
      setIdFacultad("");

      cargarEdificios();
    } catch {
      setMensaje("Error creando edificio.");
    }
  };


  //   FILTRAR DEPARTAMENTOS
  const departamentosFiltrados = departamentos.filter(dep => {
    const edificiosDelDep = edificios.filter(e => e.departamento === dep);

    if (edificiosDelDep.length === 0) return false;

    const todosDeshabilitados = edificiosDelDep.every(e => e.habilitado === false);
    if (todosDeshabilitados) return false;

    return true;
  });

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Listado de Edificios</h2>

      {/* FILTRO */}
      <select
        value={departamentoFiltro}
        onChange={(e) => setDepartamentoFiltro(e.target.value)}
        style={{ marginRight: 10, padding: 5 }}
      >
        <option value="">Todos los departamentos</option>
        {departamentosFiltrados.map((dep, i) => (
          <option key={i} value={dep}>{dep}</option>
        ))}
      </select>

      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}

      {/* LISTA */}
      <ul style={{ listStyle: "none", padding: 0, marginTop: 20 }}>
        {edificios.map((e, i) => (
          <li
            key={i}
            style={{
              ...itemStyle,
              backgroundColor: e.habilitado ? "white" : "#e5e5e5",
              opacity: e.habilitado ? 1 : 0.7,
            }}
          >
            <strong>
              <Link
                to={`/edificios/${e.nombre_edificio}`}
                style={{ textDecoration: "none", color: "#007bff" }}
              >
                {e.nombre_edificio}
              </Link>
            </strong>

            <p>Dirección: {e.direccion}</p>
            <p>Departamento: {e.departamento}</p>
            <p>ID Facultad: {e.id_facultad}</p>
            <p><strong>Estado:</strong> {e.habilitado ? "Habilitado" : "Deshabilitado"}</p>

            {rol === "administrador" && (
              <>
                <button
                  style={btnEditar}
                  onClick={() => {
                    setEdificioAEditar(e);
                    setEditIdFacultad(e.id_facultad);
                    setEditHabilitado(e.habilitado ? "true" : "false");
                    setShowModal(true);
                  }}
                >
                  Editar Edificio
                </button>

                <button
                  onClick={() => eliminarEdificio(e.nombre_edificio)}
                  style={btnEliminar}
                >
                  Eliminar
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* FORM CREAR EDIFICIO */}
      {rol === "administrador" && (
        <>
          <h3 style={{ marginTop: 40 }}>Crear Nuevo Edificio</h3>

          <form onSubmit={crearEdificio} style={{ maxWidth: 400, margin: "auto" }}>
            <input
              type="text"
              placeholder="Nombre del edificio"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              required
              style={inputStyle}
            />

            <input
              type="text"
              placeholder="Dirección"
              value={nuevaDireccion}
              onChange={(e) => setNuevaDireccion(e.target.value)}
              required
              style={inputStyle}
            />

            <input
              type="text"
              placeholder="Departamento"
              value={nuevoDepartamento}
              onChange={(e) => setNuevoDepartamento(e.target.value)}
              required
              style={inputStyle}
            />

            <select
              required
              size="5"
              value={idFacultad}
              onChange={(e) => setIdFacultad(e.target.value)}
              style={{ ...inputStyle, height: "120px", overflowY: "scroll" }}
            >
              <option value="">Seleccione una facultad...</option>
              {facultades.map((f) => (
                <option key={f.id_facultad} value={f.id_facultad}>
                  {f.nombre}
                </option>
              ))}
            </select>

            <button type="submit" style={btnCrear}>Crear Edificio</button>
          </form>
        </>
      )}

      {/* MODAL EDITAR */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Editar Edificio</h3>

            <p><strong>{edificioAEditar?.nombre_edificio}</strong></p>

            <label>Facultad:</label>
            <select
              value={editIdFacultad}
              onChange={(e) => setEditIdFacultad(e.target.value)}
              style={inputStyle}
            >
              <option value="">(sin cambios)</option>
              {facultades.map((f) => (
                <option key={f.id_facultad} value={f.id_facultad}>
                  {f.nombre}
                </option>
              ))}
            </select>

            <label>Estado del edificio:</label>
            <select
              value={editHabilitado}
              onChange={(e) => setEditHabilitado(e.target.value)}
              style={inputStyle}
            >
              <option value="">(sin cambios)</option>
              <option value="true">Habilitado</option>
              <option value="false">Deshabilitado</option>
            </select>

            <div style={{ marginTop: 15 }}>
              <button onClick={() => setShowModal(false)} style={btnCancelar}>
                Cancelar
              </button>

              <button onClick={guardarCambios} style={btnGuardar}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


const itemStyle = {
  border: "1px solid #ccc",
  padding: 12,
  borderRadius: 6,
  marginBottom: 10,
  maxWidth: 400,
  margin: "10px auto",
  textAlign: "left",
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginBottom: 10,
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const btnEliminar = {
  marginTop: 10,
  padding: "6px 10px",
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const btnEditar = {
  marginTop: 10,
  padding: "6px 10px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  marginRight: 10,
};

const btnCancelar = {
  backgroundColor: "#6c757d",
  color: "white",
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  marginRight: 10,
  cursor: "pointer",
};

const btnGuardar = {
  backgroundColor: "#28a745",
  color: "white",
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
};

const btnCrear = {
  marginTop: 10,
  padding: "8px 12px",
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  width: "100%",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContent = {
  backgroundColor: "white",
  padding: 20,
  borderRadius: 10,
  width: "90%",
  maxWidth: 400,
};
