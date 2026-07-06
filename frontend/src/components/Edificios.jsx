import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "./UserContext";
import { PageContainer, PageHeader } from "./ui/Page";
import Card, { CardHeader } from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import Field, { Input, Select } from "./ui/Field";
import Modal from "./ui/Modal";
import EmptyState from "./ui/EmptyState";
import { useToast } from "./ui/Toast";
import { useConfirm } from "./ui/Confirm";
import styles from "./Edificios.module.css";

export default function Edificios() {
  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();
  const isAdmin = rol === "administrador";

  const [edificios, setEdificios] = useState([]);
  const [departamentoFiltro, setDepartamentoFiltro] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [facultades, setFacultades] = useState([]);

  // CREAR
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDireccion, setNuevaDireccion] = useState("");
  const [nuevoDepartamento, setNuevoDepartamento] = useState("");
  const [idFacultad, setIdFacultad] = useState("");

  // MODAL EDITAR
  const [showModal, setShowModal] = useState(false);
  const [edificioAEditar, setEdificioAEditar] = useState(null);
  const [editIdFacultad, setEditIdFacultad] = useState("");
  const [editHabilitado, setEditHabilitado] = useState("");
  const [editNuevoNombre, setEditNuevoNombre] = useState("");

  const { success, error: toastError } = useToast();
  const confirm = useConfirm();

  const guardarCambios = async () => {
    const token = localStorage.getItem("token");

    const body = { nombre_original: edificioAEditar.nombre_edificio };
    if (editNuevoNombre.trim() !== "") body.nuevo_nombre_edificio = editNuevoNombre.trim();
    if (editIdFacultad !== "") body.id_facultad = parseInt(editIdFacultad);
    if (editHabilitado !== "") body.habilitado = editHabilitado === "true";

    try {
      const res = await fetch("http://localhost:8000/editarEdificio", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.detail || "Error al editar edificio.");
        return;
      }
      success("Edificio actualizado correctamente.");
      setShowModal(false);
      cargarEdificios();
    } catch {
      toastError("Error al editar edificio.");
    }
  };

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

  const cargarEdificios = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = "http://localhost:8000/edificios";
      if (departamentoFiltro) url += `?departamento=${departamentoFiltro}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setEdificios(data.edificios || []);
    } catch {
      toastError("Error cargando edificios.");
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

  const eliminarEdificio = async (nombre_edificio) => {
    const ok = await confirm({
      title: "Eliminar edificio",
      message: `¿Seguro que querés eliminar "${nombre_edificio}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      danger: true,
    });
    if (!ok) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:8000/eliminarEdificio/${encodeURIComponent(nombre_edificio)}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toastError(data.detail || "No se pudo eliminar el edificio.");
        return;
      }
      success("Edificio eliminado correctamente.");
      cargarEdificios();
    } catch {
      toastError("Error eliminando edificio.");
    }
  };

  const crearEdificio = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/crearEdificio", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_edificio: nuevoNombre,
          direccion: nuevaDireccion,
          departamento: nuevoDepartamento,
          id_facultad: parseInt(idFacultad),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.detail || "Error creando edificio.");
        return;
      }
      success("Edificio creado correctamente.");
      setNuevoNombre("");
      setNuevaDireccion("");
      setNuevoDepartamento("");
      setIdFacultad("");
      cargarEdificios();
    } catch {
      toastError("Error creando edificio.");
    }
  };

  const departamentosFiltrados = departamentos.filter((dep) => {
    const edificiosDelDep = edificios.filter((e) => e.departamento === dep);
    if (edificiosDelDep.length === 0) return false;
    return !edificiosDelDep.every((e) => e.habilitado === false);
  });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Salas"
        title="Edificios"
        description={isAdmin ? "Consultá, creá y administrá los edificios del sistema." : "Elegí un edificio para ver sus salas y reservar."}
      />

      <div className={styles.toolbar}>
        <Field label="Filtrar por departamento">
          <Select value={departamentoFiltro} onChange={(e) => setDepartamentoFiltro(e.target.value)}>
            <option value="">Todos los departamentos</option>
            {departamentosFiltrados.map((dep, i) => (
              <option key={i} value={dep}>{dep}</option>
            ))}
          </Select>
        </Field>
      </div>

      {edificios.length === 0 ? (
        <EmptyState title="No hay edificios" description="Todavía no hay edificios que coincidan con el filtro." />
      ) : (
        <div className={styles.grid}>
          {edificios.map((e, i) => (
            <Card key={i} tone={e.habilitado ? undefined : "muted"}>
              <div className={styles.cardHead}>
                <Link to={`/edificios/${e.nombre_edificio}`} className={styles.name}>
                  {e.nombre_edificio}
                </Link>
                <Badge variant={e.habilitado ? "success" : "neutral"} dot>
                  {e.habilitado ? "Habilitado" : "Deshabilitado"}
                </Badge>
              </div>

              <dl className={styles.meta}>
                <div><dt>Dirección</dt><dd>{e.direccion}</dd></div>
                <div><dt>Departamento</dt><dd>{e.departamento}</dd></div>
                <div><dt>Facultad</dt><dd>#{e.id_facultad}</dd></div>
              </dl>

              {isAdmin && (
                <div className={styles.actions}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEdificioAEditar(e);
                      setEditIdFacultad(e.id_facultad);
                      setEditHabilitado(e.habilitado ? "true" : "false");
                      setEditNuevoNombre("");
                      setShowModal(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => eliminarEdificio(e.nombre_edificio)}>
                    Eliminar
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {isAdmin && (
        <Card className={styles.createCard}>
          <CardHeader title="Crear nuevo edificio" subtitle="Registrá un edificio y asignalo a una facultad." />
          <form onSubmit={crearEdificio} className={styles.createForm}>
            <Field label="Nombre del edificio" required>
              <Input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} required />
            </Field>
            <Field label="Dirección" required>
              <Input value={nuevaDireccion} onChange={(e) => setNuevaDireccion(e.target.value)} required />
            </Field>
            <Field label="Departamento" required>
              <Input value={nuevoDepartamento} onChange={(e) => setNuevoDepartamento(e.target.value)} required />
            </Field>
            <Field label="Facultad" required>
              <Select value={idFacultad} onChange={(e) => setIdFacultad(e.target.value)} required>
                <option value="">Seleccioná una facultad…</option>
                {facultades.map((f) => (
                  <option key={f.id_facultad} value={f.id_facultad}>{f.nombre}</option>
                ))}
              </Select>
            </Field>
            <Button type="submit">Crear edificio</Button>
          </form>
        </Card>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Editar ${edificioAEditar?.nombre_edificio || "edificio"}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={guardarCambios}>Guardar cambios</Button>
          </>
        }
      >
        <div className={styles.editForm}>
          <Field label="Nuevo nombre" hint="Dejalo vacío para no cambiarlo.">
            <Input placeholder="Nuevo nombre…" value={editNuevoNombre} onChange={(e) => setEditNuevoNombre(e.target.value)} />
          </Field>
          <Field label="Facultad">
            <Select value={editIdFacultad} onChange={(e) => setEditIdFacultad(e.target.value)}>
              <option value="">(sin cambios)</option>
              {facultades.map((f) => (
                <option key={f.id_facultad} value={f.id_facultad}>{f.nombre}</option>
              ))}
            </Select>
          </Field>
          <Field label="Estado">
            <Select value={editHabilitado} onChange={(e) => setEditHabilitado(e.target.value)}>
              <option value="">(sin cambios)</option>
              <option value="true">Habilitado</option>
              <option value="false">Deshabilitado</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </PageContainer>
  );
}
