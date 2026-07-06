import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "../ui/Page";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Field, { Input, Select } from "../ui/Field";
import Modal from "../ui/Modal";
import EmptyState from "../ui/EmptyState";
import { SkeletonCard } from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import { useConfirm } from "../ui/Confirm";
import styles from "./Reservas.module.css";

export default function Reservas() {
  const [activas, setActivas] = useState([]);
  const [pasadas, setPasadas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

  const [reservaEdit, setReservaEdit] = useState(null);
  const [reservaOriginal, setReservaOriginal] = useState(null);

  const [salas, setSalas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [edificios, setEdificios] = useState([]);

  const [nuevoEdificio, setNuevoEdificio] = useState("");
  const [nuevaSala, setNuevaSala] = useState("");
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevoTurno, setNuevoTurno] = useState("");
  const [invitadosInput, setInvitadosInput] = useState("");
  const [creadorCi, setCreadorCi] = useState("");

  const token = localStorage.getItem("token");
  const { success, error: toastError, info } = useToast();
  const confirm = useConfirm();

  const formatHora = (valor) => {
    if (!valor) return "";
    if (typeof valor === "string") return valor.slice(0, 5);
    if (typeof valor === "object") {
      const h = String(valor.hours).padStart(2, "0");
      const m = String(valor.minutes).padStart(2, "0");
      return `${h}:${m}`;
    }
    return String(valor).slice(0, 5);
  };

  const cargarActivas = async () => {
    try {
      const res = await fetch("http://localhost:8000/reservasActivas", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setActivas(data.reservas_activas || []);
    } catch {
      toastError("Error cargando reservas activas.");
    }
  };

  const cargarPasadas = async () => {
    try {
      const res = await fetch("http://localhost:8000/reservasPasadas", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setPasadas(data.reservas_pasadas || []);
    } catch {
      toastError("Error cargando reservas pasadas.");
    }
  };

  const cargarTurnos = async () => {
    const res = await fetch("http://localhost:8000/turnosPosibles", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setTurnos(data.turnos_posibles || []);
  };

  const cargarSalas = async (edificio, fecha = null, turno = null) => {
    if (!edificio) return;
    let url = `http://localhost:8000/salasDelEdificio?edificio=${edificio}`;
    if (fecha) url += `&fecha=${fecha}`;
    if (turno) url += `&id_turno=${turno}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setSalas(data.salas || []);
  };

  const cargarEdificios = async () => {
    const res = await fetch("http://localhost:8000/edificios", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setEdificios(data.edificios || []);
  };

  const abrirModalEditar = async (reserva) => {
    setReservaEdit({
      id_reserva: reserva.id_reserva,
      sala: reserva.nombre_sala,
      edificio: reserva.edificio,
      fecha: reserva.fecha,
      turno: reserva.id_turno,
    });
    setReservaOriginal({
      sala: reserva.nombre_sala,
      edificio: reserva.edificio,
      fecha: reserva.fecha,
      turno: reserva.id_turno,
    });
    await cargarSalas(reserva.edificio, reserva.fecha, reserva.id_turno);
    await cargarTurnos();
    setModalAbierto(true);
  };

  const abrirModalCrear = async () => {
    setNuevoEdificio("");
    setNuevaSala("");
    setNuevaFecha("");
    setNuevoTurno("");
    setInvitadosInput("");
    setCreadorCi("");
    await cargarEdificios();
    await cargarTurnos();
    setModalCrearAbierto(true);
  };

  const guardarCambios = async () => {
    try {
      const payload = { id_reserva: reservaEdit.id_reserva };
      if (reservaEdit.sala !== reservaOriginal.sala) payload.nueva_sala = reservaEdit.sala;
      if (reservaEdit.edificio !== reservaOriginal.edificio) payload.nuevo_edificio = reservaEdit.edificio;
      if (reservaEdit.fecha !== reservaOriginal.fecha) payload.nueva_fecha = reservaEdit.fecha;
      if (Number(reservaEdit.turno) !== reservaOriginal.turno) payload.nuevo_turno = Number(reservaEdit.turno);

      if (Object.keys(payload).length === 1) {
        info("No se realizaron cambios.");
        return;
      }

      const res = await fetch("http://localhost:8000/reservas/modificar", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) toastError(data.error);
      else {
        success("Reserva modificada correctamente");
        setModalAbierto(false);
        cargarActivas();
      }
    } catch {
      toastError("Error al modificar");
    }
  };

  const cancelarReserva = async (id) => {
    const ok = await confirm({
      title: "Cancelar reserva",
      message: "¿Seguro que querés cancelar esta reserva?",
      confirmText: "Cancelar reserva",
      danger: true,
    });
    if (!ok) return;

    try {
      const res = await fetch(`http://localhost:8000/admin/cancelarReserva?id_reserva=${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.error) toastError(data.error);
      else {
        success("Reserva cancelada correctamente");
        cargarActivas();
      }
    } catch {
      toastError("Error al cancelar");
    }
  };

  const crearReserva = async () => {
    const participantes = invitadosInput
      .split(",")
      .map((ci) => ci.trim())
      .filter((ci) => ci !== "")
      .map((ci) => Number(ci));

    const payload = {
      nombre_sala: nuevaSala,
      edificio: nuevoEdificio,
      fecha: nuevaFecha,
      id_turno: Number(nuevoTurno),
      participantes,
      creador_ci: Number(creadorCi),
    };

    try {
      const res = await fetch("http://localhost:8000/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) toastError(data.error);
      else {
        success("Reserva creada correctamente");
        setModalCrearAbierto(false);
        cargarActivas();
      }
    } catch {
      toastError("Error creando reserva");
    }
  };

  useEffect(() => {
    Promise.all([cargarActivas(), cargarPasadas()]).finally(() => setLoading(false));
  }, []);

  const renderCard = (r, pasada) => (
    <Card key={r.id_reserva} tone={pasada ? "muted" : "ok"}>
      <div className={styles.head}>
        <span className={styles.room}>{r.nombre_sala} · {r.edificio}</span>
        <Badge variant="neutral">#{r.id_reserva}</Badge>
      </div>
      <div className={styles.meta}>
        <span><strong>{r.fecha}</strong></span>
        <span>{formatHora(r.hora_inicio)} → {formatHora(r.hora_fin)}</span>
      </div>
      {pasada ? (
        <p className={styles.pastNote}>Reserva pasada</p>
      ) : (
        <div className={styles.actions}>
          <Button size="sm" variant="secondary" onClick={() => abrirModalEditar(r)}>Editar</Button>
          <Button size="sm" variant="danger" onClick={() => cancelarReserva(r.id_reserva)}>Cancelar</Button>
        </div>
      )}
    </Card>
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Bibliotecario"
        title="Reservas"
        description="Consultá, creá y administrá reservas del sistema."
        actions={<Button onClick={abrirModalCrear}>Crear reserva</Button>}
      />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Reservas activas</h2>
        {loading ? (
          <div className={styles.grid}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : activas.length === 0 ? (
          <EmptyState title="Sin reservas activas" description="No hay reservas activas en este momento." />
        ) : (
          <div className={styles.grid}>{activas.map((r) => renderCard(r, false))}</div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Reservas pasadas</h2>
        {loading ? (
          <div className={styles.grid}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : pasadas.length === 0 ? (
          <EmptyState title="Sin reservas pasadas" description="Todavía no hay historial de reservas." />
        ) : (
          <div className={styles.grid}>{pasadas.map((r) => renderCard(r, true))}</div>
        )}
      </section>

      {/* CREAR */}
      <Modal
        isOpen={modalCrearAbierto}
        onClose={() => setModalCrearAbierto(false)}
        title="Crear reserva"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalCrearAbierto(false)}>Cerrar</Button>
            <Button onClick={crearReserva}>Crear</Button>
          </>
        }
      >
        <div className={styles.form}>
          <Field label="Edificio">
            <Select value={nuevoEdificio} onChange={(e) => { setNuevoEdificio(e.target.value); cargarSalas(e.target.value); }}>
              <option value="">Seleccioná…</option>
              {edificios.map((e) => (
                <option key={e.nombre_edificio} value={e.nombre_edificio}>{e.nombre_edificio}</option>
              ))}
            </Select>
          </Field>
          <Field label="Sala">
            <Select value={nuevaSala} onChange={(e) => setNuevaSala(e.target.value)}>
              <option value="">Seleccioná…</option>
              {salas.map((s) => (
                <option key={s.nombre_sala} value={s.nombre_sala}>{s.nombre_sala}</option>
              ))}
            </Select>
          </Field>
          <Field label="Fecha">
            <Input type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} />
          </Field>
          <Field label="Turno">
            <Select value={nuevoTurno} onChange={(e) => setNuevoTurno(e.target.value)}>
              <option value="">Seleccioná…</option>
              {turnos.map((t) => (
                <option key={t.id_turno} value={t.id_turno}>{t.hora_inicio.slice(0, 5)} – {t.hora_fin.slice(0, 5)}</option>
              ))}
            </Select>
          </Field>
          <Field label="CI del creador de la reserva">
            <Input value={creadorCi} onChange={(e) => setCreadorCi(e.target.value)} placeholder="Ej. 51234567" inputMode="numeric" />
          </Field>
          <Field label="Invitados" hint="CI separados por coma (opcional).">
            <Input value={invitadosInput} onChange={(e) => setInvitadosInput(e.target.value)} placeholder="Ej. 49871203, 51234567" />
          </Field>
        </div>
      </Modal>

      {/* EDITAR */}
      <Modal
        isOpen={modalAbierto && !!reservaEdit}
        onClose={() => setModalAbierto(false)}
        title={reservaEdit ? `Editar reserva #${reservaEdit.id_reserva}` : "Editar reserva"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalAbierto(false)}>Cerrar</Button>
            <Button onClick={guardarCambios}>Guardar cambios</Button>
          </>
        }
      >
        {reservaEdit && (
          <div className={styles.form}>
            <Field label="Sala">
              <Select value={reservaEdit.sala} onChange={(e) => setReservaEdit({ ...reservaEdit, sala: e.target.value })}>
                <option value="">Seleccioná…</option>
                {salas.map((s) => (
                  <option key={s.nombre_sala} value={s.nombre_sala}>{s.nombre_sala}</option>
                ))}
              </Select>
            </Field>
            <Field label="Fecha">
              <Input type="date" value={reservaEdit.fecha} onChange={(e) => setReservaEdit({ ...reservaEdit, fecha: e.target.value })} />
            </Field>
            <Field label="Turno">
              <Select value={reservaEdit.turno} onChange={(e) => setReservaEdit({ ...reservaEdit, turno: e.target.value })}>
                <option value="">Seleccioná…</option>
                {turnos.map((t) => (
                  <option key={t.id_turno} value={t.id_turno}>{t.hora_inicio.slice(0, 5)} – {t.hora_fin.slice(0, 5)}</option>
                ))}
              </Select>
            </Field>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
