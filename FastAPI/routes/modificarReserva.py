from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from db.connector import getConnection
from core.security import requireRole
from db.notificationSentences import createNotification
from datetime import datetime, timedelta

router = APIRouter(prefix="/reservas", tags=["Reservas"])

class EditReserva(BaseModel):
    id_reserva: int
    nueva_sala: str | None = None
    nuevo_edificio: str | None = None
    nueva_fecha: str | None = None
    nuevo_turno: int | None = None


@router.put("/modificar")
def modificar_reserva(payload: EditReserva, user=Depends(requireRole("Bibliotecario"))):

    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        # Buscar reserva
        cur.execute("""
            SELECT r.*, t.hora_inicio, t.hora_fin
            FROM reserva r
            JOIN turno t ON r.id_turno = t.id_turno
            WHERE r.id_reserva = %s
        """, (payload.id_reserva,))

        reserva = cur.fetchone()
        if not reserva:
            raise HTTPException(404, "La reserva no existe")
        
        if reserva["estado"] != "activa":
            raise HTTPException(400, "Solo se pueden modificar reservas activas")


        # Validar turno pasado si cambia fecha o turno
        hoy = datetime.now().date()

        if payload.nueva_fecha == hoy.strftime("%Y-%m-%d") or payload.nuevo_turno:
            # obtener hora actual y hora del turno nuevo o actual
            hora_actual = datetime.now().time()

            if payload.nuevo_turno:
                cur.execute("""
                    SELECT hora_inicio FROM turno WHERE id_turno = %s
                """, (payload.nuevo_turno,))
                nuevo_turno_info = cur.fetchone()
                if not nuevo_turno_info:
                    raise HTTPException(400, "El nuevo turno no existe")
                hora_turno = nuevo_turno_info["hora_inicio"]
            else:
                hora_turno = reserva["hora_inicio"]

            # convertir timedelta -> hora
            if isinstance(hora_turno, timedelta):
                hora_turno = (datetime.min + hora_turno).time()

            if hora_actual > hora_turno:
                raise HTTPException(400, "El turno ya pasó, no puede modificarse")


        # Validar nueva sala si viene
        if payload.nueva_sala and payload.nuevo_edificio:
            cur.execute("""
                SELECT * FROM sala
                WHERE nombre_sala = %s AND edificio = %s
            """, (payload.nueva_sala, payload.nuevo_edificio))
            nueva_sala = cur.fetchone()

            if not nueva_sala:
                raise HTTPException(400, "La nueva sala no existe")

            if nueva_sala["habilitada"] == 0:
                raise HTTPException(400, "La nueva sala no está habilitada")


        # Validar conflicto de turno con otra reserva
        nueva_fecha = payload.nueva_fecha or reserva["fecha"]
        nuevo_turno = payload.nuevo_turno or reserva["id_turno"]
        nueva_sala = payload.nueva_sala or reserva["nombre_sala"]
        nuevo_edificio = payload.nuevo_edificio or reserva["edificio"]

        cur.execute("""
            SELECT 1 FROM reserva
            WHERE nombre_sala = %s
              AND edificio = %s
              AND fecha = %s
              AND id_turno = %s
              AND estado = 'activa'
              AND id_reserva != %s
        """, (nueva_sala, nuevo_edificio, nueva_fecha, nuevo_turno, payload.id_reserva))

        if cur.fetchone():
            raise HTTPException(400, "Ya existe una reserva en la sala para esa fecha y turno")



        campos = []
        valores = []

        if payload.nueva_sala:
            campos.append("nombre_sala = %s")
            valores.append(payload.nueva_sala)

        if payload.nuevo_edificio:
            campos.append("edificio = %s")
            valores.append(payload.nuevo_edificio)

        if payload.nueva_fecha:
            campos.append("fecha = %s")
            valores.append(payload.nueva_fecha)

        if payload.nuevo_turno:
            campos.append("id_turno = %s")
            valores.append(payload.nuevo_turno)

        if not campos:
            raise HTTPException(400, "No se enviaron cambios")

        valores.append(payload.id_reserva)

        cur.execute(f"""
            UPDATE reserva
            SET {", ".join(campos)}
            WHERE id_reserva = %s
        """, tuple(valores))

        cn.commit()


        # Notificar participantes
        cur.execute("""
            SELECT ci_participante
            FROM reserva_participante
            WHERE id_reserva = %s
              AND estado_invitacion IN ('aceptada','creador')
        """, (payload.id_reserva,))

        participantes = cur.fetchall()

        for p in participantes:
            createNotification(
                p["ci_participante"],
                "RESERVA MODIFICADA",
                f"La reserva #{payload.id_reserva} ha sido modificada.",
                referencia_tipo="reserva",
                referencia_id=payload.id_reserva
            )

        return {"mensaje": "Reserva modificada correctamente"}

    finally:
        cur.close()
        cn.close()
