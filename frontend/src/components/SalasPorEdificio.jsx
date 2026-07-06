import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "./UserContext";
import CrearReserva from "./User/CrearReserva";
import NotFound from "./NotFound";
import { PageContainer, PageHeader } from "./ui/Page";
import Card, { CardHeader } from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import Field, { Input, Select } from "./ui/Field";
import Modal from "./ui/Modal";
import EmptyState from "./ui/EmptyState";
import { useToast } from "./ui/Toast";
import { useConfirm } from "./ui/Confirm";
import styles from "./SalasPorEdificio.module.css";

export default function SalasPorEdificio() {
  const { nombreEdificio } = useParams();
  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();
  const isAdmin = rol === "administrador";
  const isStaff = rol === "administrador" || rol === "bibliotecario";

  const [salas, setSalas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [fecha, setFecha] = useState("");
  const [idTurno, setIdTurno] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [nombreSala, setNombreSala] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [tipo, setTipo] = useState("");

  const hoy = new Date().toISOString().split("T")[0];

  // MODAL EDITAR
  const [modalOpen, setModalOpen] = useState(false);
  const [editNombreSala, setEditNombreSala] = useState("");
  const [salaOriginalNombre, setSalaOriginalNombre] = useState("");
  const [editCapacidad, setEditCapacidad] = useState("");
  const [editTipoSala, setEditTipoSala] = useState("");
  const [editHabilitada, setEditHabilitada] = useState(true);

  const { success, error: toastError } = useToast();
  const confirm = useConfirm();

  const abrirModal = (sala) => {
    setEditNombreSala(sala.nombre_sala);
    setSalaOriginalNombre(sala.nombre_sala);
    setEditCapacidad(sala.capacidad);
    setEditTipoSala(sala.tipo_sala);
    setEditHabilitada(sala.habilitada === 1 || sala.habilitada === true);
    setModalOpen(true);
  };

  const guardarCambios = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/modificarSala", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_sala: salaOriginalNombre,
          nuevo_nombre_sala: editNombreSala,
          edificio: nombreEdificio,
          capacidad: Number(editCapacidad),
          tipo_sala: editTipoSala,
          habilitada: editHabilitada,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.detail || "Error modificando sala.");
        return;
      }
      success("Sala modificada correctamente.");
      setModalOpen(false);
      cargarSalas();
    } catch {
      toastError("Error modificando sala.");
    }
  };

  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/turnosPosibles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTurnos(data.turnos_posibles || []);
      } catch {
        console.log("Error cargando turnos");
      }
    };
    cargarTurnos();
  }, []);

  async function cargarSalas() {
    try {
      const token = localStorage.getItem("token");
      let url = `http://localhost:8000/salasDelEdificio?edificio=${nombreEdificio}`;
      if (fecha) url += `&fecha=${fecha}`;
      if (idTurno) url += `&id_turno=${idTurno}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

      if (res.status === 404) {
        setNotFound(true);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data.salas)) {
        setSalas(data.salas);
      } else {
        setSalas([]);
      }
    } catch {
      toastError("Error cargando salas.");
    }
  }

  useEffect(() => {
    cargarSalas();
  }, [nombreEdificio, fecha, idTurno]);

  const crearSala = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/crearSala", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_sala: nombreSala,
          capacidad: parseInt(capacidad),
          tipo_sala: tipo,
          edificio: nombreEdificio,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.detail || "Error creando sala.");
        return;
      }
      success("Sala creada correctamente.");
      setNombreSala("");
      setCapacidad("");
      setTipo("");
      cargarSalas();
    } catch {
      toastError("Error creando sala.");
    }
  };

  async function eliminarSala(nombre_sala) {
    const ok = await confirm({
      title: "Eliminar sala",
      message: `¿Seguro que querés eliminar la sala "${nombre_sala}"?`,
      confirmText: "Eliminar",
      danger: true,
    });
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/eliminarSala/${encodeURIComponent(nombre_sala)}/${encodeURIComponent(nombreEdificio)}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) {
        toastError(data.detail || "Error eliminando sala.");
        return;
      }
      success("Sala eliminada correctamente.");
      cargarSalas();
    } catch {
      toastError("Error eliminando sala.");
    }
  }

  if (notFound) {
    return <NotFound mensaje="El edificio no existe." />;
  }

  const salasHabilitadas = salas.filter((s) => s.habilitada === 1 || s.habilitada === true);
  const salasDeshabilitadas = salas.filter((s) => !s.habilitada);

  const SalaCard = ({ s, deshabilitada }) => (
    <Card tone={deshabilitada ? "muted" : undefined}>
      <div className={styles.salaHead}>
        <span className={styles.salaName}>{s.nombre_sala}</span>
        <Badge variant={deshabilitada ? "neutral" : "success"} dot>
          {deshabilitada ? "No habilitada" : "Habilitada"}
        </Badge>
      </div>
      <dl className={styles.meta}>
        <div><dt>Capacidad</dt><dd>{s.capacidad}</dd></div>
        <div><dt>Tipo</dt><dd className="capitalize">{s.tipo_sala}</dd></div>
      </dl>
      {isAdmin && (
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={() => abrirModal(s)}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => eliminarSala(s.nombre_sala)}>Eliminar</Button>
        </div>
      )}
    </Card>
  );

  return (
    <PageContainer>
      <PageHeader eyebrow="Edificio" title={nombreEdificio} description="Salas disponibles y sus turnos." />

      <div className={styles.filters}>
        <Field label="Fecha">
          <Input type="date" min={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </Field>
        <Field label="Turno">
          <Select value={idTurno} onChange={(e) => setIdTurno(e.target.value)}>
            <option value="">Todos los turnos</option>
            {turnos.map((t) => (
              <option key={t.id_turno} value={t.id_turno}>
                {t.hora_inicio.slice(0, 5)} – {t.hora_fin.slice(0, 5)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Salas habilitadas</h2>
        {salasHabilitadas.length === 0 ? (
          <EmptyState title="Sin salas disponibles" description="No hay salas habilitadas para este filtro." />
        ) : (
          <div className={styles.grid}>
            {salasHabilitadas.map((s, i) => <SalaCard key={i} s={s} />)}
          </div>
        )}
      </section>

      {isStaff && salasDeshabilitadas.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Salas deshabilitadas</h2>
          <div className={styles.grid}>
            {salasDeshabilitadas.map((s, i) => <SalaCard key={i} s={s} deshabilitada />)}
          </div>
        </section>
      )}

      <CrearReserva edificio={nombreEdificio} salas={salas} />

      {isAdmin && (
        <Card className={styles.createCard}>
          <CardHeader title={`Crear sala en ${nombreEdificio}`} />
          <form onSubmit={crearSala} className={styles.createForm}>
            <Field label="Nombre de la sala" required>
              <Input value={nombreSala} onChange={(e) => setNombreSala(e.target.value)} required />
            </Field>
            <Field label="Capacidad" hint="Máximo 200." required>
              <Input type="number" min="1" max="200" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} required />
            </Field>
            <Field label="Tipo de sala" required>
              <Select value={tipo} onChange={(e) => setTipo(e.target.value)} required>
                <option value="">Seleccioná un tipo</option>
                <option value="libre">Libre</option>
                <option value="posgrado">Posgrado</option>
                <option value="docente">Docente</option>
              </Select>
            </Field>
            <Button type="submit">Crear sala</Button>
          </form>
        </Card>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Editar sala"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cerrar</Button>
            <Button onClick={guardarCambios}>Guardar cambios</Button>
          </>
        }
      >
        <div className={styles.editForm}>
          <Field label="Nombre de la sala">
            <Input value={editNombreSala} onChange={(e) => setEditNombreSala(e.target.value)} placeholder="Nuevo nombre de sala" />
          </Field>
          <Field label="Capacidad">
            <Input type="number" min="1" max="200" value={editCapacidad} onChange={(e) => setEditCapacidad(e.target.value)} />
          </Field>
          <Field label="Tipo de sala">
            <Select value={editTipoSala} onChange={(e) => setEditTipoSala(e.target.value)}>
              <option value="libre">Libre</option>
              <option value="posgrado">Posgrado</option>
              <option value="docente">Docente</option>
            </Select>
          </Field>
          <Field label="Estado">
            <Select value={editHabilitada ? "true" : "false"} onChange={(e) => setEditHabilitada(e.target.value === "true")}>
              <option value="true">Habilitada</option>
              <option value="false">Deshabilitada</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </PageContainer>
  );
}
