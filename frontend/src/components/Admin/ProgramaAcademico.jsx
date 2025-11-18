import { useEffect, useState } from "react";

export default function ProgramaManager() {

  const [programas, setProgramas] = useState([]);
  const [nombrePrograma, setNombrePrograma] = useState("");
  const [idFacultad, setIdFacultad] = useState("");
  const [tipo, setTipo] = useState("");

  const [editNombre, setEditNombre] = useState(null);
  const [editIdFacultad, setEditIdFacultad] = useState("");
  const [editTipo, setEditTipo] = useState("");

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const API = "http://localhost:8000/programa";

  const cargarProgramas = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al obtener programas");
        setProgramas([]);
        return;
      }

      setError("");
      setProgramas(data || []);

    } catch {
      setError("Error de conexión");
      setProgramas([]);
    }
  };

  useEffect(() => {
    cargarProgramas();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre_programa: nombrePrograma,
          id_facultad: idFacultad,
          tipo
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al crear programa");
        return;
      }

      setOk("Programa creado correctamente");
      setNombrePrograma("");
      setIdFacultad("");
      setTipo("");

      cargarProgramas();

    } catch {
      setError("Error de conexión");
    }
  };

  const handleUpdate = async (nombre) => {
    setError("");
    setOk("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/update/${nombre}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id_facultad: editIdFacultad,
          tipo: editTipo
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al actualizar programa");
        return;
      }

      setOk("Programa actualizado");
      setEditNombre(null);
      setEditIdFacultad("");
      setEditTipo("");

      cargarProgramas();

    } catch {
      setError("Error de conexión");
    }
  };

  const handleDelete = async (nombre) => {
    if (!confirm("¿Seguro que deseas eliminar este programa?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/delete/${nombre}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al eliminar programa");
        return;
      }

      setOk("Programa eliminado");
      cargarProgramas();

    } catch {
      setError("Error de conexión");
    }
  };


  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>Gestión de Programas Académicos</h2>

      <form onSubmit={handleCreate} style={styles.form}>
        <input
          type="text"
          placeholder="Nombre del Programa"
          value={nombrePrograma}
          onChange={(e) => setNombrePrograma(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="number"
          placeholder="ID Facultad"
          value={idFacultad}
          onChange={(e) => setIdFacultad(e.target.value)}
          style={styles.input}
          required
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          style={styles.input}
          required
        >
          <option value="">Seleccionar tipo</option>
          <option value="grado">Grado</option>
          <option value="posgrado">Posgrado</option>
        </select>

        <button style={styles.btnCreate}>Crear</button>
      </form>

      {error && <p style={styles.error}>{error}</p>}
      {ok && <p style={styles.ok}>{ok}</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Programa</th>
            <th>ID Facultad</th>
            <th>Tipo</th>
            <th style={{ width: 180 }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {programas.map((p) => (
            <tr key={p.nombre_programa}>
              <td>{p.nombre_programa}</td>

              <td>
                {editNombre === p.nombre_programa ? (
                  <input
                    style={styles.inputSmall}
                    value={editIdFacultad}
                    onChange={(e) => setEditIdFacultad(e.target.value)}
                  />
                ) : (
                  p.id_facultad
                )}
              </td>

              <td>
                {editNombre === p.nombre_programa ? (
                  <select
                    style={styles.inputSmall}
                    value={editTipo}
                    onChange={(e) => setEditTipo(e.target.value)}
                  >
                    <option value="grado">Grado</option>
                    <option value="posgrado">Posgrado</option>
                  </select>
                ) : (
                  p.tipo
                )}
              </td>

              <td>
                {editNombre === p.nombre_programa ? (
                  <>
                    <button
                      onClick={() => handleUpdate(p.nombre_programa)}
                      style={styles.btnSave}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditNombre(null)}
                      style={styles.btnCancel}
                    >
                      X
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      style={styles.btnEdit}
                      onClick={() => {
                        setEditNombre(p.nombre_programa);
                        setEditIdFacultad(p.id_facultad);
                        setEditTipo(p.tipo);
                      }}
                    >
                      Editar
                    </button>

                    <button
                      style={styles.btnDelete}
                      onClick={() => handleDelete(p.nombre_programa)}
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: "900px",
    margin: "auto",
    padding: "20px",
    background: "#f7f7f7",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: "20px",
  },
  form: {
    marginBottom: "20px",
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  input: {
    padding: "8px",
    width: "250px",
  },
  inputSmall: {
    padding: "5px",
    width: "140px",
  },
  btnCreate: {
    padding: "8px 14px",
    background: "#007bff",
    border: "none",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    background: "white",
    borderCollapse: "collapse",
  },
  error: { color: "red" },
  ok: { color: "green" },
  btnEdit: {
    padding: "4px 8px",
    background: "#ffc107",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "5px",
  },
  btnDelete: {
    padding: "4px 8px",
    background: "#dc3545",
    border: "none",
    color: "white",
    borderRadius: "4px",
    cursor: "pointer",
  },
  btnSave: {
    padding: "4px 8px",
    background: "green",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "5px",
  },
  btnCancel: {
    padding: "4px 8px",
    background: "gray",
    border: "none",
    color: "white",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
