import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "../ui/Page";
import Button from "../ui/Button";
import Field, { Input } from "../ui/Field";
import Table from "../ui/Table";
import Modal from "../ui/Modal";
import EmptyState from "../ui/EmptyState";
import { SkeletonRows } from "../ui/Skeleton";
import { useToast } from "../ui/useToast";
import { useConfirm } from "../ui/useConfirm";
import styles from "./Admin.module.css";

export default function FacultadManager() {
  const [facultades, setFacultades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState("");

  const API = "http://localhost:8000/facultad";
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();

  const cargarFacultades = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.detail || "Error al obtener facultades");
        setFacultades([]);
        return;
      }
      setFacultades(data || []);
    } catch {
      toastError("Error de conexión");
      setFacultades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFacultades();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.detail || "Error al crear facultad");
        return;
      }
      success("Facultad creada correctamente");
      setNombre("");
      setShowCreateModal(false);
      cargarFacultades();
    } catch {
      toastError("Error de conexión");
    }
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/update/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: editNombre }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.detail || "Error al actualizar facultad");
        return;
      }
      success("Facultad actualizada");
      setEditId(null);
      setEditNombre("");
      cargarFacultades();
    } catch {
      toastError("Error de conexión");
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Eliminar facultad",
      message: "¿Seguro que querés eliminar esta facultad?",
      confirmText: "Eliminar",
      danger: true,
    });
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.detail || "Error al eliminar facultad");
        return;
      }
      success("Facultad eliminada");
      cargarFacultades();
    } catch {
      toastError("Error de conexión");
    }
  };

  return (
    <PageContainer size="narrow">
      <PageHeader
        eyebrow="Administración"
        title="Facultades"
        description="Creá y administrá las facultades del sistema."
        actions={<Button onClick={() => setShowCreateModal(true)}>Nueva facultad</Button>}
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva facultad"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
            <Button type="submit" form="crear-facultad-form">Crear</Button>
          </>
        }
      >
        <form id="crear-facultad-form" onSubmit={handleCreate} className="form-stack">
          <Field label="Nombre de la facultad">
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Facultad de Ingeniería" required />
          </Field>
        </form>
      </Modal>

      {loading ? (
        <Table>
          <thead>
            <tr><th>Nombre</th><th className={styles.actionsCol}>Acciones</th></tr>
          </thead>
          <tbody>
            <SkeletonRows rows={4} columns={2} />
          </tbody>
        </Table>
      ) : facultades.length === 0 ? (
        <EmptyState title="No hay facultades" description="Creá la primera facultad con el formulario de arriba." />
      ) : (
        <Table>
          <thead>
            <tr><th>Nombre</th><th className={styles.actionsCol}>Acciones</th></tr>
          </thead>
          <tbody>
            {facultades.map((fac) => (
              <tr key={fac.id_facultad}>
                <td>
                  {editId === fac.id_facultad ? (
                    <Input className={styles.editControl} value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
                  ) : (
                    fac.nombre
                  )}
                </td>
                <td className={styles.actionsCol}>
                  <div className={styles.rowActions}>
                    {editId === fac.id_facultad ? (
                      <>
                        <Button size="sm" onClick={() => handleUpdate(fac.id_facultad)}>Guardar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Cancelar</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => { setEditId(fac.id_facultad); setEditNombre(fac.nombre); }}>Editar</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(fac.id_facultad)}>Eliminar</Button>
                      </>
                    )}
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
