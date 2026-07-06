import { useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { PageContainer, PageHeader } from "../ui/Page";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Field, { Input, Textarea } from "../ui/Field";
import Modal from "../ui/Modal";
import EmptyState from "../ui/EmptyState";
import { SkeletonCard } from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import { useConfirm } from "../ui/Confirm";
import styles from "./Sanciones.module.css";

export default function Sanciones() {
  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();

  const [activas, setActivas] = useState([]);
  const [pasadas, setPasadas] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const { success, error: toastError } = useToast();
  const confirm = useConfirm();

  // MODAL CREAR
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCi, setNewCi] = useState("");
  const [newFechaInicio, setNewFechaInicio] = useState("");
  const [newFechaFin, setNewFechaFin] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");
  const [newError, setNewError] = useState("");
  const [loadingCrear, setLoadingCrear] = useState(false);

  // MODAL EDITAR
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    ci: "",
    fecha_inicio_original: "",
    fecha_fin_original: "",
    nueva_fecha_inicio: "",
    nueva_fecha_fin: "",
    nueva_descripcion: "",
  });

  const cargarSancionesActivas = async () => {
    try {
      const res = await fetch("http://localhost:8000/sanctionsActive", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setActivas(data.sanciones_activas || []);
    } catch {
      toastError("Error cargando sanciones activas.");
    }
  };

  const cargarSancionesPasadas = async () => {
    try {
      const res = await fetch("http://localhost:8000/sanctionsPast", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setPasadas(data.sanciones_pasadas || []);
    } catch {
      toastError("Error cargando sanciones pasadas.");
    }
  };

  useEffect(() => {
    Promise.all([cargarSancionesActivas(), cargarSancionesPasadas()]).finally(() => setLoading(false));
  }, []);

  const quitarSancion = async (id) => {
    const ok = await confirm({
      title: "Quitar sanción",
      message: "¿Seguro que querés quitar esta sanción?",
      confirmText: "Quitar",
      danger: true,
    });
    if (!ok) return;

    try {
      const res = await fetch(`http://localhost:8000/sancion/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toastError(data.detail || "Error al quitar sanción.");
        return;
      }
      success(data.mensaje || "Sanción quitada correctamente.");
      await cargarSancionesActivas();
      await cargarSancionesPasadas();
    } catch (err) {
      console.error(err);
      toastError("Error al quitar la sanción.");
    }
  };

  const crearSancionManual = async (e) => {
    e.preventDefault();
    setNewError("");

    if (!newCi || !newFechaInicio || !newFechaFin || !newDescripcion.trim()) {
      setNewError("Todos los campos son obligatorios.");
      return;
    }

    setLoadingCrear(true);
    try {
      const res = await fetch("http://localhost:8000/sancion/crear", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          ci: Number(newCi),
          fechaInicio: newFechaInicio,
          fechaFin: newFechaFin,
          descripcion: newDescripcion.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNewError(data.detail || "Error al crear sanción.");
        return;
      }
      success("Sanción creada correctamente.");
      setShowCreateModal(false);
      setNewCi("");
      setNewFechaInicio("");
      setNewFechaFin("");
      setNewDescripcion("");
      await cargarSancionesActivas();
      await cargarSancionesPasadas();
    } finally {
      setLoadingCrear(false);
    }
  };

  const abrirModalEditar = (s) => {
    setEditData({
      ci: s.ci_participante,
      fecha_inicio_original: s.fecha_inicio,
      fecha_fin_original: s.fecha_fin,
      nueva_fecha_inicio: s.fecha_inicio,
      nueva_fecha_fin: s.fecha_fin,
      nueva_descripcion: s.descripcion,
    });
    setShowEditModal(true);
  };

  const editarSancion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/editarSancion", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.detail || "Error al editar sanción.");
        return;
      }
      success("Sanción editada correctamente.");
      setShowEditModal(false);
      await cargarSancionesActivas();
      await cargarSancionesPasadas();
    } catch {
      toastError("No se pudo editar la sanción.");
    }
  };

  if (rol !== "bibliotecario") return null;

  const renderCard = (s, pasada) => (
    <Card key={s.id} tone={pasada ? "muted" : "warn"}>
      <div className={styles.head}>
        <span className={styles.who}>CI {s.ci_participante}</span>
        <Badge variant="neutral">#{s.id}</Badge>
      </div>
      <p className={styles.email}>{s.email}</p>
      <p className={styles.desc}>{s.descripcion}</p>
      <div className={styles.dates}>
        <span>Desde <strong>{s.fecha_inicio}</strong></span>
        <span>Hasta <strong>{s.fecha_fin}</strong></span>
      </div>
      {!pasada && (
        <div className={styles.actions}>
          <Button size="sm" variant="secondary" onClick={() => abrirModalEditar(s)}>Editar</Button>
          <Button size="sm" variant="danger" onClick={() => quitarSancion(s.id)}>Quitar</Button>
        </div>
      )}
    </Card>
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Bibliotecario"
        title="Sanciones"
        description="Consultá, creá y administrá las sanciones a participantes."
        actions={<Button onClick={() => setShowCreateModal(true)}>Agregar sanción</Button>}
      />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sanciones activas</h2>
        {loading ? (
          <div className={styles.grid}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : activas.length === 0 ? (
          <EmptyState title="Sin sanciones activas" description="No hay sanciones vigentes." />
        ) : (
          <div className={styles.grid}>{activas.map((s) => renderCard(s, false))}</div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sanciones pasadas</h2>
        {loading ? (
          <div className={styles.grid}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : pasadas.length === 0 ? (
          <EmptyState title="Sin sanciones pasadas" description="Todavía no hay historial de sanciones." />
        ) : (
          <div className={styles.grid}>{pasadas.map((s) => renderCard(s, true))}</div>
        )}
      </section>

      {/* CREAR */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva sanción"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
            <Button type="submit" form="crear-sancion" disabled={loadingCrear}>
              {loadingCrear ? "Creando…" : "Crear"}
            </Button>
          </>
        }
      >
        <form id="crear-sancion" onSubmit={crearSancionManual} className={styles.form}>
          <Field label="CI del participante">
            <Input value={newCi} onChange={(e) => setNewCi(e.target.value)} inputMode="numeric" placeholder="Ej. 51234567" />
          </Field>
          <Field label="Fecha de inicio">
            <Input type="date" value={newFechaInicio} onChange={(e) => setNewFechaInicio(e.target.value)} />
          </Field>
          <Field label="Fecha de fin">
            <Input type="date" value={newFechaFin} onChange={(e) => setNewFechaFin(e.target.value)} />
          </Field>
          <Field label="Descripción" error={newError}>
            <Textarea value={newDescripcion} onChange={(e) => setNewDescripcion(e.target.value)} />
          </Field>
        </form>
      </Modal>

      {/* EDITAR */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Editar sanción · CI ${editData.ci}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
            <Button type="submit" form="editar-sancion">Guardar cambios</Button>
          </>
        }
      >
        <form id="editar-sancion" onSubmit={editarSancion} className={styles.form}>
          <Field label="Nueva fecha de inicio">
            <Input type="date" value={editData.nueva_fecha_inicio} onChange={(v) => setEditData({ ...editData, nueva_fecha_inicio: v.target.value })} />
          </Field>
          <Field label="Nueva fecha de fin">
            <Input type="date" value={editData.nueva_fecha_fin} onChange={(v) => setEditData({ ...editData, nueva_fecha_fin: v.target.value })} />
          </Field>
          <Field label="Nueva descripción">
            <Textarea value={editData.nueva_descripcion} onChange={(v) => setEditData({ ...editData, nueva_descripcion: v.target.value })} />
          </Field>
        </form>
      </Modal>
    </PageContainer>
  );
}
