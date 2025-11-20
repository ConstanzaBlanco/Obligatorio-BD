import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "./UserContext";
import CrearReserva from "./User/CrearReserva";

export default function SalasPorEdificio() {

  const { nombreEdificio } = useParams();
  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();

  const [salas, setSalas] = useState([]);
  const [turnos, setTurnos] = useState([]);

  const [fecha, setFecha] = useState("");
  const [idTurno, setIdTurno] = useState("");

  const [mensaje, setMensaje] = useState("");

  const [nombreSala, setNombreSala] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [tipo, setTipo] = useState("");

  const hoy = new Date().toISOString().split("T")[0];

  // MODAL
  const [modalOpen, setModalOpen] = useState(false);
  const [editNombreSala, setEditNombreSala] = useState("");
  const [editCapacidad, setEditCapacidad] = useState("");
  const [editTipoSala, setEditTipoSala] = useState("");
  const [editHabilitada, setEditHabilitada] = useState(true);

  const abrirModal = (sala) => {
    setEditNombreSala(sala.nombre_sala);
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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre_sala: editNombreSala,
          edificio: nombreEdificio,
          capacidad: Number(editCapacidad),
          tipo_sala: editTipoSala,
          habilitada: editHabilitada
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.detail || "Error modificando sala.");
        return;
      }

      setMensaje("Sala modificada correctamente.");
      setModalOpen(false);
      cargarSalas();

    } catch {
      setMensaje("Error modificando sala.");
    }
  };


  // CARGAR TURNOS
  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8000/turnosPosibles", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        setTurnos(data.turnos_posibles || []);

      } catch {
        console.log("Error cargando turnos");
      }
    };

    cargarTurnos();
  }, []);

  // CARGAR SALAS
  async function cargarSalas() {
    try {
      const token = localStorage.getItem("token");

      let url = `http://localhost:8000/salasDelEdificio?edificio=${nombreEdificio}`;
      if (fecha) url += `&fecha=${fecha}`;
      if (idTurno) url += `&id_turno=${idTurno}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (Array.isArray(data.salas)) {
        setSalas(data.salas);
        setMensaje("");
      } else if (data.mensaje) {
        setSalas([]);
        setMensaje(data.mensaje);
      } else {
        setSalas([]);
        setMensaje("No hay salas disponibles.");
      }

    } catch {
      setMensaje("Error cargando salas.");
    }
  }

  useEffect(() => {
    cargarSalas();
  }, [nombreEdificio, fecha, idTurno]);


  // CREAR SALA
  const crearSala = async (e) => {
    e.preventDefault();
    setMensaje("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/crearSala", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre_sala: nombreSala,
          capacidad: parseInt(capacidad),
          tipo_sala: tipo,
          edificio: nombreEdificio
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.detail || "Error creando sala.");
        return;
      }

      setMensaje("Sala creada correctamente.");
      setNombreSala("");
      setCapacidad("");
      setTipo("");
      cargarSalas();

    } catch {
      setMensaje("Error creando sala.");
    }
  };


  // ELIMINAR SALA 

  async function eliminarSala(nombre_sala) {
    if (!window.confirm(`¿Seguro que deseas eliminar la sala "${nombre_sala}"?`))
      return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8000/eliminarSala/${encodeURIComponent(nombre_sala)}/${encodeURIComponent(nombreEdificio)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.detail || "Error eliminando sala.");
        return;
      }

      setMensaje("Sala eliminada correctamente.");
      cargarSalas();

    } catch {
      setMensaje("Error eliminando sala.");
    }
  }

  const salasHabilitadas = salas.filter(s => s.habilitada === 1 || s.habilitada === true);
  const salasDeshabilitadas = salas.filter(s => !s.habilitada);

  return (
    <div style={{ marginTop: 30 }}>
      <h2 style={{ textAlign: "center" }}>
        Salas del edificio <b>{nombreEdificio}</b>
      </h2>

      {/* FILTROS */}
      <div style={{
        maxWidth: 400,
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginTop: 20
      }}>
        
        <input 
          type="date"
          min={hoy}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <select value={idTurno} onChange={(e) => setIdTurno(e.target.value)}>
          <option value="">Seleccionar turno</option>
          {turnos.map((t) => (
            <option key={t.id_turno} value={t.id_turno}>
              {t.hora_inicio.slice(0,5)} - {t.hora_fin.slice(0,5)}
            </option>
          ))}
        </select>
      </div>

      {mensaje && (
        <p style={{ color: mensaje.includes("error") ? "red" : "green", textAlign: "center", marginTop: 10 }}>
          {mensaje}
        </p>
      )}

      {/*     SALAS HABILITADAS         */}
      <h3 style={{ textAlign: "center", marginTop: 30 }}>Salas habilitadas</h3>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 20,
        marginTop: 20
      }}>
        {salasHabilitadas.map((s, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ccc",
              background: "#ffffff",
              padding: 15,
              borderRadius: 10,
              width: 300,
              textAlign: "left",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3>{s.nombre_sala}</h3>
            <p><strong>Capacidad:</strong> {s.capacidad}</p>
            <p><strong>Tipo:</strong> {s.tipo_sala}</p>
            <p><strong>Estado:</strong> Habilitada</p>

            {rol === "administrador" && (
              <>
                <button
                  onClick={() => abrirModal(s)}
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    marginTop: 10,
                    borderRadius: 5,
                    cursor: "pointer",
                    marginRight: 10
                  }}
                >
                  Editar
                </button>

                {/* BOTÓN ELIMINAR  */}
                <button
                  onClick={() => eliminarSala(s.nombre_sala)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    marginTop: 10,
                    borderRadius: 5,
                    cursor: "pointer"
                  }}
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* SALAS DESHABILITADAS */}
      {(rol === "administrador" || rol === "bibliotecario") && (
        <>
          <h3 style={{ textAlign: "center", marginTop: 40 }}>Salas deshabilitadas</h3>

          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 20,
            marginTop: 20
          }}>
            {salasDeshabilitadas.map((s, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid #ccc",
                  background: "#e0e0e0",
                  padding: 15,
                  borderRadius: 10,
                  width: 300,
                  textAlign: "left",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <h3>{s.nombre_sala}</h3>
                <p><strong>Capacidad:</strong> {s.capacidad}</p>
                <p><strong>Tipo:</strong> {s.tipo_sala}</p>
                <p><strong>Estado:</strong> No habilitada</p>

                {rol === "administrador" && (
                  <>
                    <button
                      onClick={() => abrirModal(s)}
                      style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        marginTop: 10,
                        borderRadius: 5,
                        cursor: "pointer",
                        marginRight: 10
                      }}
                    >
                      Editar
                    </button>

                    {/* BOTÓN ELIMINAR */}
                    <button
                      onClick={() => eliminarSala(s.nombre_sala)}
                      style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        marginTop: 10,
                        borderRadius: 5,
                        cursor: "pointer"
                      }}
                    >
                      Eliminar
                    </button>
                  </>
                )}

              </div>
            ))}
          </div>
        </>
      )}

      {/* FORMULARIO DE RESERVA */}
      <div style={{ marginTop: 40 }}>
        <CrearReserva edificio={nombreEdificio} salas={salas} />
      </div>

      {/* FORM CREAR SALA */}
      {rol === "administrador" && (
        <div style={{ marginTop: 50, maxWidth: 400, margin: "50px auto" }}>
          <h3>Crear nueva sala en {nombreEdificio}</h3>

          <form onSubmit={crearSala}>
            <input
              type="text"
              placeholder="Nombre de la sala"
              value={nombreSala}
              onChange={(e) => setNombreSala(e.target.value)}
              required
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Capacidad (máx 200)"
              value={capacidad}
              min="1"
              max="200"
              onChange={(e) => setCapacidad(e.target.value)}
              required
              style={inputStyle}
            />

            <select
              required
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              style={inputStyle}
            >
              <option value="">Tipo de sala</option>
              <option value="libre">Libre</option>
              <option value="posgrado">Posgrado</option>
              <option value="docente">Docente</option>
            </select>

            <button type="submit" style={btnCrear}>Crear sala</button>
          </form>
        </div>
      )}


      {/* MODAL EDITAR */}
      {modalOpen && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>Editar sala</h3>

            <input
              type="number"
              min="1"
              max="200"
              value={editCapacidad}
              onChange={(e) => setEditCapacidad(e.target.value)}
              style={inputStyle}
            />

            <select
              value={editTipoSala}
              onChange={(e) => setEditTipoSala(e.target.value)}
              style={inputStyle}
            >
              <option value="libre">Libre</option>
              <option value="posgrado">Posgrado</option>
              <option value="docente">Docente</option>
            </select>

            <select
              value={editHabilitada ? "true" : "false"}
              onChange={(e) => setEditHabilitada(e.target.value === "true")}
              style={inputStyle}
            >
              <option value="true">Habilitada</option>
              <option value="false">Deshabilitada</option>
            </select>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  padding: 10,
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  flex: 1
                }}
              >
                Cerrar
              </button>

              <button
                onClick={guardarCambios}
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: 10,
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  flex: 1
                }}
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

const inputStyle = {
  width: "100%",
  padding: "8px",
  marginBottom: "10px",
  borderRadius: 6,
  border: "1px solid #ccc",
};

const btnCrear = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalBox = {
  backgroundColor: "white",
  padding: 20,
  borderRadius: 10,
  width: 350,
  boxShadow: "0 3px 10px rgba(0,0,0,0.3)"
};
