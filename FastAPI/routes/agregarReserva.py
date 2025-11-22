from fastapi import APIRouter, Depends
from db.connector import getConnection
from pydantic import BaseModel
from core.security import requireRole
from datetime import datetime, timedelta
from db.notificationSentences import createNotification

router = APIRouter()

class ReservationRequest(BaseModel):
    nombre_sala: str
    edificio: str
    fecha: str
    id_turno: int
    participantes: list[int]

@router.post("/reservar")
def reservar(request: ReservationRequest, user=Depends(requireRole("Usuario"))):
    try:
        roleDb = user["rol"]
        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        ci = user["ci"]

        # LIMITE DIARIO
        cur.execute("""
            SELECT COUNT(*) AS reservas_diarias
            FROM reserva r
            JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE rp.ci_participante = %s AND r.fecha = %s
            AND r.estado != 'cancelada';
        """, (ci, request.fecha))

        row = cur.fetchone()
        limite_diario_superado = row and row["reservas_diarias"] >= 2

        # Obtener sala
        cur.execute("""
            SELECT nombre_sala, edificio, tipo_sala, capacidad, habilitada
            FROM sala
            WHERE nombre_sala = %s AND edificio = %s;
        """, (request.nombre_sala, request.edificio))

        sala = cur.fetchone()
        if not sala:
            return {"error": "No se encontró la sala o edificio especificado"}

        if sala["habilitada"] == 0:
            return {"error": "La sala no está habilitada"}

        # Validar participantes
        for participanteCi in request.participantes:
            cur.execute("SELECT ci FROM participante WHERE ci = %s", (participanteCi,))
            if not cur.fetchone():
                return {"error": f"El participante {participanteCi} no existe"}

        capacidad_maxima = sala["capacidad"]
        if (1 + len(request.participantes)) > capacidad_maxima:
            return {"error": "Excede la capacidad de la sala"}

        # Turno
        cur.execute("""
            SELECT id_turno, hora_inicio
            FROM turno
            WHERE id_turno = %s;
        """, (request.id_turno,))

        turno_info = cur.fetchone()
        if not turno_info:
            return {"error": "El turno no existe"}

        # Validar turno pasado
        hoy = datetime.now().date()
        if request.fecha == hoy.strftime("%Y-%m-%d"):
            hora_actual = datetime.now().time()
            hora_turno = turno_info["hora_inicio"]

            if isinstance(hora_turno, timedelta):
                hora_turno = (datetime.min + hora_turno).time()
            elif isinstance(hora_turno, str):
                hora_turno = datetime.strptime(hora_turno, "%H:%M:%S").time()

            if hora_actual > hora_turno:
                return {"error": "El turno ya pasó hoy"}

        es_excepcion = False

        # SALA POSGRADO
        if sala["tipo_sala"] == "posgrado":
            cur.execute("""
                SELECT 1
                FROM participante_programa_academico 
                WHERE ci_participante = %s AND rol = 'docente';
            """, (ci,))
            es_docente = cur.fetchone()

            if es_docente:
                return {"error": "Los docentes no pueden reservar salas de posgrado"}

            cur.execute("""
                SELECT pa.tipo
                FROM participante_programa_academico ppa
                JOIN programa_academico pa ON ppa.nombre_programa = pa.nombre_programa
                WHERE ppa.ci_participante = %s AND pa.tipo = 'posgrado';
            """, (ci,))
            es_posgrado = cur.fetchone()

            if not es_posgrado:
                return {"error": "Solo estudiantes de posgrado pueden reservar"}

            es_excepcion = True

        # SALA DOCENTE
        elif sala["tipo_sala"] == "docente":
            cur.execute("""
                SELECT 1 FROM participante_programa_academico
                WHERE ci_participante = %s AND rol = 'docente';
            """, (ci,))
            es_docente = cur.fetchone()

            if not es_docente:
                return {"error": "Solo docentes pueden reservar esta sala"}

            es_excepcion = True

        # LIMITE DIARIO
        if limite_diario_superado and not es_excepcion:
            return {"error": "Ya reservaste 2 horas hoy"}

        # LIMITE SEMANAL
        if not es_excepcion:
            cur.execute("""
                SELECT COUNT(*) AS cantidad_reservas
                FROM reserva r
                JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
                WHERE YEARWEEK(r.fecha, 1) = YEARWEEK(%s, 1)
                AND rp.ci_participante = %s
                AND r.estado != 'cancelada';
            """, (request.fecha, ci))

            resp4 = cur.fetchone()
            if resp4["cantidad_reservas"] >= 3:
                return {"error": "Ya tenés 3 reservas esta semana"}

        # Verificar si existe reserva
        cur.execute("""
            SELECT estado
            FROM reserva
            WHERE nombre_sala = %s 
            AND edificio = %s
            AND fecha = %s 
            AND id_turno = %s;
        """, (request.nombre_sala, request.edificio, request.fecha, request.id_turno))

        existente = cur.fetchone()
        if existente and existente["estado"] == "activa":
            return {"error": "La sala ya está reservada en esa fecha y turno"}

        # Verificar sanción
        cur.execute("""
            SELECT ci_participante 
            FROM sancion_participante
            WHERE ci_participante = %s
            AND CURDATE() BETWEEN fecha_inicio AND fecha_fin;
        """, (ci,))
        if cur.fetchall():
            return {"error": "Estás sancionado, no podés reservar"}

        # Crear reserva
        cur.execute("""
            INSERT INTO reserva (nombre_sala, edificio, fecha, id_turno, estado, creador) 
            VALUES (%s, %s, %s, %s, 'activa', %s);
        """, (request.nombre_sala, request.edificio, request.fecha, request.id_turno, ci))

        cn.commit()
        id_reserva = cur.lastrowid

        # Asociar creador
        cur.execute("""
            INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, estado_invitacion) 
            VALUES (%s, %s, FALSE, 'creador');
        """, (ci, id_reserva))
        cn.commit()

        # Invitados + notificación
        for ci_participantes in request.participantes:
            cur.execute("""
                INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, estado_invitacion)
                VALUES (%s, %s, FALSE, 'pendiente');
            """, (ci_participantes, id_reserva))

            createNotification(
                ci_participantes,  
                "INVITACION",
                f"Fuiste invitado por {ci} a una reserva en la sala {request.nombre_sala} ({request.edificio}) "
                f"para el día {request.fecha} en el turno {request.id_turno}",
                referencia_tipo="reserva",
                referencia_id=id_reserva
            )


        cn.commit()

        return {
            "mensaje": "Reserva creada correctamente",
            "id_reserva": id_reserva,
            "creador": ci,
            "participantes_invitados": request.participantes,
            "estado_invitaciones": "pendiente"
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass
