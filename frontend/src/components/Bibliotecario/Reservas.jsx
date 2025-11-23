import { useEffect, useState } from "react";

export default function Reservas() {
  const [activas, setActivas] = useState([]);
  const [pasadas, setPasadas] = useState([]);
  const [error, setError] = useState("");

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

  // NUEVO: CI del creador
  const [creadorCi, setCreadorCi] = useState("");

  const token = localStorage.getItem("token");

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
      const res = await fetch("http://localhost:8000/reservasActivas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setActivas(data.reservas_activas || []);
    } catch {
      setError("Error cargando reservas activas.");
    }
  };

  const cargarPasadas = async () => {
    try {
      const res = await fetch("http://localhost:8000/reservasPasadas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPasadas(data.reservas_pasadas || []);
    } catch {
      setError("Error cargando reservas pasadas.");
    }
  };

  const cargarTurnos = async () => {
    const res = await fetch("http://localhost:8000/turnosPosibles", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTurnos(data.turnos_posibles || []);
  };

  const cargarSalas = async (edificio, fecha = null, turno = null) => {
    if (!edificio) return;

    let url = `http://localhost:8000/salasDelEdificio?edificio=${edificio}`;
    if (fecha) url += `&fecha=${fecha}`;
    if (turno) url += `&id_turno=${turno}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setSalas(data.salas || []);
  };

  const cargarEdificios = async () => {
    const res = await fetch("http://localhost:8000/edificios", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setEdificios(data.edificios || []);
  };

  const abrirModalEditar = async (reserva) => {
    // SET DE EDIT
    setReservaEdit({
      id_reserva: reserva.id_reserva,
      sala: reserva.nombre_sala,
      edificio: reserva.edificio,
      fecha: reserva.fecha,
      turno: reserva.id_turno,
    });

    // SET DE ORIGINAL
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

      if (reservaEdit.sala !== reservaOriginal.sala)
        payload.nueva_sala = reservaEdit.sala;

      if (reservaEdit.edificio !== reservaOriginal.edificio)
        payload.nuevo_edificio = reservaEdit.edificio;

      if (reservaEdit.fecha !== reservaOriginal.fecha)
        payload.nueva_fecha = reservaEdit.fecha;

      if (Number(reservaEdit.turno) !== reservaOriginal.turno)
        payload.nuevo_turno = Number(reservaEdit.turno);

      if (Object.keys(payload).length === 1) {
        alert("No se realizaron cambios.");
        return;
      }

      const res = await fetch("http://localhost:8000/reservas/modificar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.error) alert(data.error);
      else {
        alert("Reserva modificada correctamente");
        setModalAbierto(false);
        cargarActivas();
      }
    } catch {
      alert("Error al modificar");
    }
  };

  const cancelarReserva = async (id) => {
    if (!confirm("¿Seguro que deseas cancelar esta reserva?")) return;

    try {
      const res = await fetch(
        `http://localhost:8000/admin/cancelarReserva?id_reserva=${id}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (data.error) alert(data.error);
      else {
        alert("Reserva cancelada correctamente");
        cargarActivas();
      }
    } catch {
      alert("Error al cancelar");
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.error) alert(data.error);
      else {
        alert("Reserva creada correctamente");
        setModalCrearAbierto(false);
        cargarActivas();
      }
    } catch {
      alert("Error creando reserva");
    }
  };

  useEffect(() => {
    cargarActivas();
    cargarPasadas();
  }, []);

  return (
    <div style={{ marginTop: 30 }}>
      <h1>Reservas</h1>

      <button
        onClick={abrirModalCrear}
        style={{
          padding: "8px 12px",
          background: "green",
          color: "white",
          borderRadius: 6,
          border: "none",
          marginBottom: 20,
        }}
      >
        Crear reserva
      </button>

      {/* RESERVAS ACTIVAS */}
      <h2>Reservas Activas</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {activas.map((r) => (
          <div key={r.id_reserva} style={cardStyle}>
            <p>
              <b>ID:</b> {r.id_reserva}
            </p>
            <p>
              <b>Sala:</b> {r.nombre_sala}
            </p>
            <p>
              <b>Edificio:</b> {r.edificio}
            </p>
            <p>
              <b>Fecha:</b> {r.fecha}
            </p>
            <p>
              <b>Turno:</b> {formatHora(r.hora_inicio)} -{" "}
              {formatHora(r.hora_fin)}
            </p>

            <button onClick={() => abrirModalEditar(r)} style={btnEdit}>
              Editar reserva
            </button>

            <button onClick={() => cancelarReserva(r.id_reserva)} style={btnCancel}>
              Cancelar reserva
            </button>
          </div>
        ))}
      </div>

      {/* RESERVAS PASADAS */}
      <h2 style={{ marginTop: 40 }}>Reservas Pasadas</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {pasadas.map((r) => (
          <div key={r.id_reserva} style={cardStyle}>
            <p>
              <b>ID:</b> {r.id_reserva}
            </p>
            <p>
              <b>Sala:</b> {r.nombre_sala}
            </p>
            <p>
              <b>Edificio:</b> {r.edificio}
            </p>
            <p>
              <b>Fecha:</b> {r.fecha}
            </p>
            <p>
              <b>Turno:</b> {formatHora(r.hora_inicio)} -{" "}
              {formatHora(r.hora_fin)}
            </p>
            <p style={{ color: "gray" }}>
              <i>Reserva pasada</i>
            </p>
          </div>
        ))}
      </div>

      {/* MODALES */}

      {modalCrearAbierto && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h2>Crear Reserva</h2>

            <label>Edificio:</label>
            <select
              value={nuevoEdificio}
              onChange={(e) => {
                setNuevoEdificio(e.target.value);
                cargarSalas(e.target.value);
              }}
            >
              <option value="">Seleccione...</option>
              {edificios.map((e) => (
                <option key={e.nombre_edificio} value={e.nombre_edificio}>
                  {e.nombre_edificio}
                </option>
              ))}
            </select>

            <label>Sala:</label>
            <select value={nuevaSala} onChange={(e) => setNuevaSala(e.target.value)}>
              <option value="">Seleccione...</option>
              {salas.map((s) => (
                <option key={s.nombre_sala} value={s.nombre_sala}>
                  {s.nombre_sala}
                </option>
              ))}
            </select>

            <label>Fecha:</label>
            <input
              type="date"
              value={nuevaFecha}
              onChange={(e) => setNuevaFecha(e.target.value)}
            />

            <label>Turno:</label>
            <select
              value={nuevoTurno}
              onChange={(e) => setNuevoTurno(e.target.value)}
            >
              <option value="">Seleccione...</option>
              {turnos.map((t) => (
                <option key={t.id_turno} value={t.id_turno}>
                  {t.hora_inicio.slice(0, 5)} - {t.hora_fin.slice(0, 5)}
                </option>
              ))}
            </select>

            {/* NUEVO CAMPO */}
            <label>CI del creador de la reserva:</label>
            <input
              type="text"
              value={creadorCi}
              onChange={(e) => setCreadorCi(e.target.value)}
              placeholder="Ej: 51234567"
            />

            <label>Invitados (CI separados por coma):</label>
            <input
              type="text"
              value={invitadosInput}
              onChange={(e) => setInvitadosInput(e.target.value)}
            />

            <div style={modalStyles.buttons}>
              <button
                onClick={() => setModalCrearAbierto(false)}
                style={modalStyles.cancel}
              >
                Cerrar
              </button>

              <button onClick={crearReserva} style={modalStyles.save}>
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAbierto && reservaEdit && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h2>Editar Reserva #{reservaEdit.id_reserva}</h2>

            <label>Sala:</label>
            <select
              value={reservaEdit.sala}
              onChange={(e) =>
                setReservaEdit({ ...reservaEdit, sala: e.target.value })
              }
            >
              <option value="">Seleccione...</option>
              {salas.map((s) => (
                <option key={s.nombre_sala} value={s.nombre_sala}>
                  {s.nombre_sala}
                </option>
              ))}
            </select>

            <label>Fecha:</label>
            <input
              type="date"
              value={reservaEdit.fecha}
              onChange={(e) =>
                setReservaEdit({ ...reservaEdit, fecha: e.target.value })
              }
            />

            <label>Turno:</label>
            <select
              value={reservaEdit.turno}
              onChange={(e) =>
                setReservaEdit({ ...reservaEdit, turno: e.target.value })
              }
            >
              <option value="">Seleccione...</option>
              {turnos.map((t) => (
                <option key={t.id_turno} value={t.id_turno}>
                  {t.hora_inicio.slice(0, 5)} - {t.hora_fin.slice(0, 5)}
                </option>
              ))}
            </select>

            <div style={modalStyles.buttons}>
              <button
                onClick={() => setModalAbierto(false)}
                style={modalStyles.cancel}
              >
                Cerrar
              </button>

              <button onClick={guardarCambios} style={modalStyles.save}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  padding: 10,
  width: 260,
};

const btnEdit = {
  marginTop: 10,
  padding: "6px 10px",
  background: "navy",
  color: "white",
  border: "none",
  borderRadius: 5,
  width: "100%",
};

const btnCancel = {
  marginTop: 10,
  padding: "6px 10px",
  background: "crimson",
  color: "white",
  border: "none",
  borderRadius: 5,
  width: "100%",
};

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "white",
    padding: 30,
    borderRadius: 10,
    width: 400,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancel: {
    background: "gray",
    color: "white",
    padding: "8px 12px",
    borderRadius: 6,
    border: "none",
  },
  save: {
    background: "navy",
    color: "white",
    padding: "8px 12px",
    borderRadius: 6,
    border: "none",
  },
};
