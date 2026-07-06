import { useState, useEffect } from "react";
import { useUser } from "../useUser";
import Card, { CardHeader } from "../ui/Card";
import Button from "../ui/Button";
import Field, { Input, Select } from "../ui/Field";
import { useToast } from "../ui/useToast";
import styles from "./CrearReserva.module.css";

export default function CrearReserva({ edificio, salas }) {
  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();

  const [nombreSala, setNombreSala] = useState("");
  const [fecha, setFecha] = useState("");
  const [idTurno, setIdTurno] = useState("");
  const [participantes, setParticipantes] = useState("");
  const [turnos, setTurnos] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const { success } = useToast();
  const hoy = new Date().toISOString().split("T")[0];

  // Cargar turnos desde backend
  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/turnosPosibles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTurnos(data.turnos_posibles || []);
      } catch (e) {
        console.error("Error cargando turnos:", e);
      }
    };
    cargarTurnos();
  }, []);

  // Solo los usuarios pueden crear reservas.
  if (rol !== "usuario") return null;

  const crearReserva = async (e) => {
    e.preventDefault();
    setError("");

    if (!nombreSala || !fecha || !idTurno) {
      setError("Completá todos los campos obligatorios.");
      return;
    }
    if (fecha < hoy) {
      setError("La fecha no puede ser menor a hoy.");
      return;
    }

    const participantesArray =
      participantes.trim() === ""
        ? []
        : participantes.split(",").map((x) => parseInt(x.trim())).filter((x) => !isNaN(x));

    const token = localStorage.getItem("token");
    setSaving(true);
    try {
      const res = await fetch("http://localhost:8000/reservar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre_sala: nombreSala,
          edificio,
          fecha,
          id_turno: parseInt(idTurno),
          participantes: participantesArray,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        success(`Reserva creada correctamente (ID ${data.id_reserva}).`);
        setNombreSala("");
        setFecha("");
        setIdTurno("");
        setParticipantes("");
      }
    } catch {
      setError("Error al crear reserva.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className={styles.card}>
      <CardHeader title={`Reservar una sala en ${edificio}`} subtitle="Elegí sala, fecha y turno disponible." />
      <form className={styles.form} onSubmit={crearReserva}>
        <Field label="Sala" required>
          <Select value={nombreSala} onChange={(e) => setNombreSala(e.target.value)} required>
            <option value="">Seleccioná una sala</option>
            {salas.map((s, i) => (
              <option key={i} value={s.nombre_sala}>{s.nombre_sala}</option>
            ))}
          </Select>
        </Field>

        <Field label="Fecha" required>
          <Input type="date" min={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </Field>

        <Field label="Turno" required>
          <Select value={idTurno} onChange={(e) => setIdTurno(e.target.value)} required>
            <option value="">Seleccioná un turno</option>
            {turnos.map((t) => (
              <option key={t.id_turno} value={t.id_turno}>
                {t.hora_inicio.slice(0, 5)} – {t.hora_fin.slice(0, 5)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Participantes" hint="CI separados por coma (opcional)." error={error}>
          <Input
            placeholder="Ej. 51234567, 49871203"
            value={participantes}
            onChange={(e) => setParticipantes(e.target.value)}
          />
        </Field>

        <Button type="submit" disabled={saving}>
          {saving ? "Creando…" : "Crear reserva"}
        </Button>
      </form>
    </Card>
  );
}
