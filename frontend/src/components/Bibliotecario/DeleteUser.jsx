import { useEffect, useState } from "react";

export default function DeleteUser() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const token = localStorage.getItem("token");

  // Cargar usuarios
  const loadUsers = async () => {
    setError("");
    try {
      const res = await fetch("http://localhost:8000/users/Usuario", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al cargar usuarios");
        return;
      }

      setUsers(data.usuarios);

    } catch (err) {
      console.error(err);
      setError("No se pudo obtener la lista de usuarios");
    }
  };

  // Eliminar usuario
  const handleDelete = async (correo) => {
    if (!confirm(`¿Eliminar al usuario ${correo}?`)) return;

    try {
      const res = await fetch(`http://localhost:8000/deleteUser/${correo}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al eliminar usuario");
        return;
      }

      setOk(`Usuario ${correo} eliminado correctamente ✔`);
      loadUsers();
      setTimeout(() => setOk(""), 2500);

    } catch (err) {
      console.error(err);
      setError("Error al eliminar usuario");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <>
      <style>{`
        .delete-users-container {
          max-width: 800px;
          margin: 30px auto;
          text-align: center;
        }

        .user-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 25px;
        }

        .user-table th, .user-table td {
          border: 1px solid #ddd;
          padding: 12px;
        }

        .user-table th {
          background-color: #007bff;
          color: white;
        }

        .btn-delete {
          background-color: #dc3545;
          color: white;
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.2s;
        }

        .btn-delete:hover {
          background-color: #b52a3a;
        }

        .ok-msg {
          color: green;
          font-weight: bold;
          margin-top: 10px;
        }

        .error-msg {
          color: red;
          font-weight: bold;
          margin-top: 10px;
        }
      `}</style>

      {/* --------- HTML --------- */}
      <div className="delete-users-container">
        <h2>Eliminar Usuarios</h2>

        {error && <p className="error-msg">{error}</p>}
        {ok && <p className="ok-msg">{ok}</p>}

        <table className="user-table">
          <thead>
            <tr>
              <th>Correo</th>
              <th>Rol</th>
              <th>Último acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4">No hay usuarios para mostrar</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.correo}>
                  <td>{u.correo}</td>
                  <td>{u.rol}</td>
                  <td>{u.last_access || "N/A"}</td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(u.correo)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
