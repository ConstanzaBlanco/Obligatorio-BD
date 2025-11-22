import { useEffect, useState } from "react";

export default function Reservas() {
  const [activas, setActivas] = useState([]);
  const [pasadas, setPasadas] = useState([]);
  const [error, setError] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [reservaEdit, setReservaEdit] = useState(null);

  const [salas, setSalas] = useState([]);
  const [turnos, setTurnos] = useState([]);

  const token = localStorage.getItem("token");

  const formatHora = (valor) => {
    if (!valor) return "";
    return typeof valor === "string" ? valor.slice(0, 5) : "";
  };

  const cargarActivas = async () => {
    try {
      const res = await fetch("http://localhost:8000/reservasActivas", {
        headers: { Authorization: `Bearer ${token}` }
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
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPasadas(data.reservas_pasadas || []);
    } catch {
      setError("Error cargando reservas pasadas.");
    }
  };

  const cargarTurnos = async () => {
    const res = await fetch("http://localhost:8000/turnosPosibles", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setTurnos(data.turnos_posibles || []);
  };

  const cargarSalas = async (edificio, fecha, turno) => {
    let url = `http://localhost:8000/salasDelEdificio?edificio=${edificio}`;
    if (fecha) url += `&fecha=${fecha}`;
    if (turno) url += `&id_turno=${turno}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setSalas(data.salas || []);
  };

  const abrirModalEditar = async (reserva) => {
    setReservaEdit({
      id_reserva: reserva.id_reserva,
      sala: reserva.nombre_sala,
      edificio: reserva.edificio,
      fecha: reserva.fecha,
      turno: reserva.id_turno
    });

    await cargarSalas(reserva.edificio, reserva.fecha, reserva.id_turno);
    await cargarTurnos();

    setModalAbierto(true);
  };

  const guardarCambios = async () => {
    try {
      const payload = {
        id_reserva: reservaEdit.id_reserva,
        nueva_sala: reservaEdit.sala,
        nuevo_edificio: reservaEdit.edificio,
        nueva_fecha: reservaEdit.fecha,
        nuevo_turno: Number(reservaEdit.turno)
      };

      const res = await fetch("http://localhost:8000/reservas/modificar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        alert("Reserva modificada correctamente");
        setModalAbierto(false);
        cargarActivas();
      }
    } catch {
      alert("Error al modificar");
    }
  };

  // Cancelar como Bibliotecario
  const cancelarReserva = async (id) => {
    if (!confirm("¿Seguro que deseas cancelar esta reserva?")) return;

    try {
      const res = await fetch(
        `http://localhost:8000/admin/cancelarReserva?id_reserva=${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        alert("Reserva cancelada correctamente");
        cargarActivas();
      }
    } catch {
      alert("Error al cancelar la reserva");
    }
  };

  useEffect(() => {
    cargarActivas();
    cargarPasadas();
  }, []);

  return (
    <div style={{ marginTop: 30 }}>
      <h1>Reservas</h1>

      <h2>Reservas Activas</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {activas.map((r) => (
          <div key={r.id_reserva} style={{ border: "1px solid #ccc", padding: 10, width: 260 }}>
            <p><b>ID:</b> {r.id_reserva}</p>
            <p><b>Sala:</b> {r.nombre_sala}</p>
            <p><b>Edificio:</b> {r.edificio}</p>
            <p><b>Fecha:</b> {r.fecha}</p>
            <p><b>Turno:</b> {formatHora(r.hora_inicio)} - {formatHora(r.hora_fin)}</p>

            <button
              onClick={() => abrirModalEditar(r)}
              style={{
                marginTop: 10,
                padding: "6px 10px",
                background: "navy",
                color: "white",
                border: "none",
                borderRadius: 5,
                width: "100%"
              }}
            >
              Editar reserva
            </button>

            {/* BOTÓN CANCELAR (ADMIN) */}
            <button
              onClick={() => cancelarReserva(r.id_reserva)}
              style={{
                marginTop: 10,
                padding: "6px 10px",
                background: "crimson",
                color: "white",
                border: "none",
                borderRadius: 5,
                width: "100%"
              }}
            >
              Cancelar reserva
            </button>
          </div>
        ))}
      </div>

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

              <button
                onClick={guardarCambios}
                style={modalStyles.save}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//
// ESTILOS DEL MODAL
//
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
    gap: 12
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 20
  },
  cancel: {
    background: "gray",
    color: "white",
    padding: "8px 12px",
    borderRadius: 6,
    border: "none"
  },
  save: {
    background: "navy",
    color: "white",
    padding: "8px 12px",
    borderRadius: 6,
    border: "none"
  }
};
