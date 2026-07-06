import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer, PageHeader } from "../ui/Page";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Table from "../ui/Table";
import { Select } from "../ui/Field";
import EmptyState from "../ui/EmptyState";
import { SkeletonRows } from "../ui/Skeleton";
import { useToast } from "../ui/useToast";
import { useConfirm } from "../ui/useConfirm";
import styles from "./Admin.module.css";

const ROLE_VARIANT = {
  Usuario: "info",
  Bibliotecario: "accent",
  Administrador: "success",
};

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [miRol, setMiRol] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();

  const loadMyRole = async () => {
    try {
      const res = await fetch("http://localhost:8000/me", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setMiRol(data.rol);
    } catch (err) {
      console.error("Error obteniendo mi rol", err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch("http://localhost:8000/users", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) {
        toastError("Error al cargar usuarios");
        return;
      }
      setUsers(data.usuarios);
    } catch (err) {
      console.error(err);
      toastError("No se pudo obtener la lista de usuarios");
    }
  };

  const handleChangeRole = async (correo, nuevoRol) => {
    try {
      const res = await fetch("http://localhost:8000/updateUserRole", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ correo, rol: nuevoRol }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("Error updateUserRole", data);
        toastError("Error al actualizar rol");
        return;
      }
      success(`Rol actualizado para ${correo}`);
      loadUsers();
    } catch (error) {
      console.error(error);
      toastError("No se pudo actualizar el rol");
    }
  };

  const handleChangeRoleBiblio = async (correo, nuevoRol) => {
    try {
      const res = await fetch("http://localhost:8000/users/updateRol", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ correo, rol: nuevoRol }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("Error /users/updateRol", data);
        toastError("Error al actualizar rol académico");
        return;
      }
      success("Rol actualizado correctamente");
      loadUsers();
    } catch (error) {
      console.error(error);
      toastError("No se pudo actualizar el rol académico");
    }
  };

  const handleDelete = async (correo) => {
    const ok = await confirm({
      title: "Eliminar usuario",
      message: `¿Eliminar al usuario ${correo}? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      danger: true,
    });
    if (!ok) return;

    try {
      const res = await fetch(`http://localhost:8000/deleteUser/${correo}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        toastError("Error al eliminar usuario");
        return;
      }
      success(`Usuario ${correo} eliminado`);
      loadUsers();
    } catch (err) {
      console.error(err);
      toastError("Error al eliminar usuario");
    }
  };

  useEffect(() => {
    Promise.all([loadMyRole(), loadUsers()]).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount
  }, []);

  const canModify = miRol === "Administrador" || miRol === "Bibliotecario";

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Administración"
        title="Usuarios"
        description="Gestioná roles y cuentas del sistema."
        actions={
          miRol === "Administrador" && (
            <Button onClick={() => navigate("/crearBibliotecario")}>Crear bibliotecario</Button>
          )
        }
      />

      {loading ? (
        <Table>
          <thead>
            <tr>
              <th>Correo</th>
              <th>Rol</th>
              <th>Último acceso</th>
              <th className={styles.actionsCol}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <SkeletonRows rows={5} columns={4} />
          </tbody>
        </Table>
      ) : users.length === 0 ? (
        <EmptyState title="No hay usuarios" description="Todavía no hay usuarios para mostrar." />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Correo</th>
              <th>Rol</th>
              {canModify && <th>Modificar rol</th>}
              <th>Último acceso</th>
              <th className={styles.actionsCol}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.correo}>
                <td>{u.correo}</td>
                <td><Badge variant={ROLE_VARIANT[u.rol] || "neutral"}>{u.rol}</Badge></td>

                {miRol === "Administrador" && (
                  <td>
                    <Select className={styles.editControl} defaultValue={u.rol} onChange={(e) => handleChangeRole(u.correo, e.target.value)}>
                      <option value="Usuario">Usuario</option>
                      <option value="Bibliotecario">Bibliotecario</option>
                      <option value="Administrador">Administrador</option>
                    </Select>
                  </td>
                )}
                {miRol === "Bibliotecario" && (
                  <td>
                    <Select className={styles.editControl} defaultValue={u.rol} onChange={(e) => handleChangeRoleBiblio(u.correo, e.target.value)}>
                      <option value="alumno">Alumno</option>
                      <option value="docente">Docente</option>
                    </Select>
                  </td>
                )}

                <td>{u.last_access || "N/A"}</td>
                <td className={styles.actionsCol}>
                  <div className={styles.rowActions}>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(u.correo)}>Eliminar</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </PageContainer>
  );
}
