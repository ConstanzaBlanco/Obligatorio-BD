import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [miRol, setMiRol] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const loadMyRole = async () => {
    try {
      const res = await fetch("http://localhost:8000/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok) {
        setMiRol(data.rol);
      }
    } catch (err) {
      console.error("Error obteniendo mi rol", err);
    }
  };

  const loadUsers = async () => {
    setError("");
    try {
      const res = await fetch("http://localhost:8000/users", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        setError("Error al cargar usuarios");
        return;
      }

      setUsers(data.usuarios);
    } catch (err) {
      console.error(err);
      setError("No se pudo obtener la lista de usuarios");
    }
  };

  const handleChangeRole = async (correo, nuevoRol) => {
    setError("");
    try {
      const payload = { correo, rol: nuevoRol };

      const res = await fetch("http://localhost:8000/updateUserRole", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Error updateUserRole", data);
        setError("Error al actualizar rol");
        return;
      }

      setOk(`Rol actualizado correctamente para ${correo}`);
      loadUsers();

      setTimeout(() => {
        setOk("");
      }, 2500);
    } catch (error) {
      console.error(error);
      setError("No se pudo actualizar el rol");
    }
  };

  const handleChangeRoleBiblio = async (correo, nuevoRol) => {
    setError("");
    try {
      const payload = { correo, rol: nuevoRol };

      const res = await fetch("http://localhost:8000/users/updateRol", { 
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Error /users/updateRol", data);
        setError("Error al actualizar rol académico");
        return;
      }

      setOk("Rol actualizado correctamente");
      loadUsers();

      setTimeout(() => {
        setOk("");
      }, 2500);
    } catch (error) {
      console.error(error);
      setError("No se pudo actualizar el rol académico");
    }
  };

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
        setError("Error al eliminar usuario");
        return;
      }

      setOk(`Usuario ${correo} eliminado correctamente`);
      loadUsers();
      setTimeout(() => setOk(""), 2500);
    } catch (err) {
      console.error(err);
      setError("Error al eliminar usuario");
    }
  };

  useEffect(() => {
    loadMyRole();
    loadUsers();
  }, []);

  return (
    <>
      <style>{`
        .users-container {
          max-width: 900px;
          margin: 40px auto;
          padding: 20px;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          text-align: center;
        }

        .title {
          font-size: 28px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .btn-create {
          background-color: #28a745;
          color: white;
          padding: 12px 18px;
          border: none;
          margin-bottom: 25px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          transition: 0.25s;
        }

        .btn-create:hover {
          background-color: #218838;
          transform: scale(1.03);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 15px;
        }

        thead {
          background: #007bff;
          color: white;
        }

        th, td {
          padding: 14px;
          border-bottom: 1px solid #ddd;
        }

        tr:hover {
          background: #f1f5ff;
        }

        .role-badge {
          padding: 6px 10px;
          border-radius: 6px;
          font-weight: bold;
          color: white;
        }

        .role-usuario {
          background-color: #3498db;
        }

        .role-bibliotecario {
          background-color: #9b59b6;
        }

        .btn-delete {
          background-color: #dc3545;
          color: white;
          padding: 8px 14px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.2s;
        }

        .btn-delete:hover {
          background-color: #b52a3a;
        }

        .ok-msg {
          color: #27ae60;
          font-weight: 600;
          margin: 12px 0;
        }

        .error-msg {
          color: #c0392b;
          font-weight: 600;
          margin: 12px 0;
        }

        .select-role {
          padding: 10px 14px;
          font-size: 14px;
          border: 1px solid #b5b5b5;
          border-radius: 6px;
          background: #fafafa;
          cursor: pointer;
          transition: 0.25s ease;
          outline: none;
        }

        .select-role:hover {
          background: #f0f0f0;
          border-color: #2980b9;
        }

        .select-role:focus {
          background: #fff;
          border-color: #007bff;
          box-shadow: 0 0 4px rgba(0, 123, 255, 0.5);
        }

        .select-role option {
          padding: 10px;
        }
      `}</style>

      <div className="users-container">
        <h2 className="title">Gestión de Usuarios</h2>

        {miRol === "Administrador" && (
          <button
            className="btn-create"
            onClick={() => navigate("/crearBibliotecario")}
          >
            Crear Bibliotecario
          </button>
        )}

        {error && <p className="error-msg">{error}</p>}
        {ok && <p className="ok-msg">{ok}</p>}

        <table>
          <thead>
            <tr>
              <th>Correo</th>
              <th>Rol</th>

              {(miRol === "Administrador" || miRol === "Bibliotecario") && (
                <th>Modificar Rol</th>
              )}

              <th>Último acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5">No hay usuarios para mostrar</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.correo}>
                  <td>{u.correo}</td>

                  <td>
                    <span
                      className={
                        "role-badge " +
                        (u.rol === "Usuario"
                          ? "role-usuario"
                          : "role-bibliotecario")
                      }
                    >
                      {u.rol}
                    </span>
                  </td>

                  {miRol === "Administrador" && (
                    <td>
                      <select
                        className="select-role"
                        defaultValue={u.rol}
                        onChange={(e) =>
                          handleChangeRole(u.correo, e.target.value)
                        }
                      >
                        <option value="Usuario">Usuario</option>
                        <option value="Bibliotecario">Bibliotecario</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                    </td>
                  )}

                  {miRol === "Bibliotecario" && (
                    <td>
                      <select
                        className="select-role"
                        defaultValue={u.rol}
                        onChange={(e) =>
                          handleChangeRoleBiblio(
                            u.correo,
                            e.target.value
                          )
                        }
                      >
                        <option value="alumno">Alumno</option>
                        <option value="docente">Docente</option>
                      </select>
                    </td>
                  )}

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
