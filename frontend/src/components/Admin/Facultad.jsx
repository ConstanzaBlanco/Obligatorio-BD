import { useEffect, useState } from "react";

export default function FacultadManager() {

  const [facultades, setFacultades] = useState([]);
  const [nombre, setNombre] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const API = "http://localhost:8000/facultad";

  const cargarFacultades = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al obtener facultades");
        setFacultades([]);
        return;
      }

      setError("");
      setFacultades(data || []);

    } catch {
      setError("Error de conexión");
      setFacultades([]);
    }
  };

  useEffect(() => {
    cargarFacultades();
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
        body: JSON.stringify({ nombre })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al crear facultad");
        return;
      }

      setOk("Facultad creada correctamente");
      setNombre("");
      cargarFacultades();

    } catch {
      setError("Error de conexión");
    }
  };

  const handleUpdate = async (id) => {
    setError("");
    setOk("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/update/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre: editNombre })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al actualizar facultad");
        return;
      }

      setOk("Facultad actualizada");
      setEditId(null);
      setEditNombre("");
      cargarFacultades();

    } catch {
      setError("Error de conexión");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar esta facultad?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al eliminar facultad");
        return;
      }

      setOk("Facultad eliminada");
      cargarFacultades();

    } catch {
      setError("Error de conexión");
    }
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>Gestión de Facultades</h2>

      <form onSubmit={handleCreate} style={styles.form}>
        <input
          type="text"
          placeholder="Nombre Facultad"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={styles.input}
          required
        />
        <button style={styles.btnCreate}>Crear</button>
      </form>

      {error && <p style={styles.error}>{error}</p>}
      {ok && <p style={styles.ok}>{ok}</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th style={{ width: 150 }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {facultades.map((fac) => (
            <tr key={fac.id_facultad}>
              <td>{fac.id_facultad}</td>

              <td>
                {editId === fac.id_facultad ? (
                  <input
                    style={styles.inputSmall}
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                  />
                ) : (
                  fac.nombre
                )}
              </td>

              <td>
                {editId === fac.id_facultad ? (
                  <>
                    <button
                      onClick={() => handleUpdate(fac.id_facultad)}
                      style={styles.btnSave}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditId(null)}
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
                        setEditId(fac.id_facultad);
                        setEditNombre(fac.nombre);
                      }}
                    >
                      Editar
                    </button>

                    <button
                      style={styles.btnDelete}
                      onClick={() => handleDelete(fac.id_facultad)}
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
    maxWidth: "700px",
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
