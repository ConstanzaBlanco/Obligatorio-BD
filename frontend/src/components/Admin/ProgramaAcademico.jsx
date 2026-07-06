import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "../ui/Page";
import Card, { CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import Field, { Input, Select } from "../ui/Field";
import Table from "../ui/Table";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import { useToast } from "../ui/Toast";
import { useConfirm } from "../ui/Confirm";
import styles from "./Admin.module.css";

export default function ProgramaManager() {
  const [programas, setProgramas] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [nombrePrograma, setNombrePrograma] = useState("");
  const [idFacultad, setIdFacultad] = useState("");
  const [tipo, setTipo] = useState("");

  const [editNombre, setEditNombre] = useState(null);
  const [editIdFacultad, setEditIdFacultad] = useState("");
  const [editTipo, setEditTipo] = useState("");

  const API = "http://localhost:8000/programa";
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();

  const cargarProgramas = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.detail || "Error al obtener programas");
        return;
      }
      setProgramas(data.programas || []);
      setFacultades(data.facultades || []);
    } catch {
      toastError("Error de conexión");
    }
  };

  useEffect(() => {
    cargarProgramas();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_programa: nombrePrograma, id_facultad: idFacultad, tipo }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.detail || "Error al crear programa");
        return;
      }
      success("Programa creado correctamente");
      setNombrePrograma("");
      setIdFacultad("");
      setTipo("");
      cargarProgramas();
    } catch {
      toastError("Error de conexión");
    }
  };

  const handleUpdate = async (nombre) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/update/${nombre}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id_facultad: editIdFacultad, tipo: editTipo }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.detail || "Error al actualizar programa");
        return;
      }
      success("Programa actualizado");
      setEditNombre(null);
      setEditIdFacultad("");
      setEditTipo("");
      cargarProgramas();
    } catch {
      toastError("Error de conexión");
    }
  };

  const handleDelete = async (nombre) => {
    const ok = await confirm({
      title: "Eliminar programa",
      message: "¿Seguro que querés eliminar este programa?",
      confirmText: "Eliminar",
      danger: true,
    });
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/delete/${nombre}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.detail || "Error al eliminar programa");
        return;
      }
      success("Programa eliminado");
      cargarProgramas();
    } catch {
      toastError("Error de conexión");
    }
  };

  return (
    <PageContainer>
      <PageHeader eyebrow="Administración" title="Programas académicos" description="Gestioná los programas y su facultad asociada." />

      <Card className={styles.createCard}>
        <CardHeader title="Nuevo programa" />
        <form onSubmit={handleCreate} className={styles.createForm}>
          <Field label="Nombre del programa">
            <Input value={nombrePrograma} onChange={(e) => setNombrePrograma(e.target.value)} placeholder="Ej. Ingeniería en Informática" required />
          </Field>
          <Field label="Facultad">
            <Select value={idFacultad} onChange={(e) => setIdFacultad(e.target.value)} required>
              <option value="">Seleccioná una facultad</option>
              {facultades.map((f) => (
                <option key={f.id_facultad} value={f.id_facultad}>{f.nombre}</option>
              ))}
            </Select>
          </Field>
          <Field label="Tipo">
            <Select value={tipo} onChange={(e) => setTipo(e.target.value)} required>
              <option value="">Seleccioná un tipo</option>
              <option value="grado">Grado</option>
              <option value="posgrado">Posgrado</option>
            </Select>
          </Field>
          <div className={styles.submit}>
            <Button type="submit">Crear</Button>
          </div>
        </form>
      </Card>

      {programas.length === 0 ? (
        <EmptyState title="No hay programas" description="Creá el primer programa con el formulario de arriba." />
      ) : (
        <Table>
          <thead>
            <tr><th>Programa</th><th>Facultad</th><th>Tipo</th><th className={styles.actionsCol}>Acciones</th></tr>
          </thead>
          <tbody>
            {programas.map((p) => {
              const editing = editNombre === p.nombre_programa;
              return (
                <tr key={p.nombre_programa}>
                  <td>{p.nombre_programa}</td>
                  <td>
                    {editing ? (
                      <Select className={styles.editControl} value={editIdFacultad} onChange={(e) => setEditIdFacultad(e.target.value)}>
                        {facultades.map((f) => (
                          <option key={f.id_facultad} value={f.id_facultad}>{f.nombre}</option>
                        ))}
                      </Select>
                    ) : (
                      facultades.find((f) => f.id_facultad === p.id_facultad)?.nombre || "Desconocido"
                    )}
                  </td>
                  <td>
                    {editing ? (
                      <Select className={styles.editControl} value={editTipo} onChange={(e) => setEditTipo(e.target.value)}>
                        <option value="grado">Grado</option>
                        <option value="posgrado">Posgrado</option>
                      </Select>
                    ) : (
                      <Badge variant={p.tipo === "posgrado" ? "info" : "neutral"} className="capitalize">{p.tipo}</Badge>
                    )}
                  </td>
                  <td className={styles.actionsCol}>
                    <div className={styles.rowActions}>
                      {editing ? (
                        <>
                          <Button size="sm" onClick={() => handleUpdate(p.nombre_programa)}>Guardar</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditNombre(null)}>Cancelar</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => { setEditNombre(p.nombre_programa); setEditIdFacultad(p.id_facultad); setEditTipo(p.tipo); }}>Editar</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(p.nombre_programa)}>Eliminar</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </PageContainer>
  );
}
