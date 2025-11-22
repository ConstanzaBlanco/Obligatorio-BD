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
def reservar(request: ReservationRequest, user=Depends(requireRole("Usuario","Bibliotecario"))):
    try:
        roleDb = user["rol"]
        es_bibliotecario = (roleDb == "Bibliotecario")

        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        ci = user["ci"]


        # NO PERMITIR FECHAS PASADAS
        hoy = datetime.now().date()
        fecha_reserva = datetime.strptime(request.fecha, "%Y-%m-%d").date()

        if fecha_reserva < hoy:
            return {"error": "No se puede reservar para una fecha pasada"}

        # -------- LIMITE DIARIO (solo usuario) --------
        if not es_bibliotecario:
            cur.execute("""
                SELECT COUNT(*) AS reservas_diarias
                FROM reserva r
                JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
                WHERE rp.ci_participante = %s AND r.fecha = %s
                AND r.estado != 'cancelada';
            """, (ci, request.fecha))

            row = cur.fetchone()
            if row and row["reservas_diarias"] >= 2:
                return {"error": "Ya reservaste 2 horas hoy"}

        # OBTENER SALA
        cur.execute("""
            SELECT nombre_sala, edificio, tipo_sala, capacidad, habilitada
            FROM sala
            WHERE nombre_sala = %s AND edificio = %s;
        """, (request.nombre_sala, request.edificio))

        sala = cur.fetchone()
        if not sala:
            return {"error": "No se encontró la sala o edificio especificado"}

        if sala["habilitada"] == 0 and not es_bibliotecario:
            return {"error": "La sala no está habilitada"}

        # VERIFICAR CAPACIDAD
        capacidad_maxima = sala["capacidad"]
        if (1 + len(request.participantes)) > capacidad_maxima:
            return {"error": "Excede la capacidad de la sala"}

        # TURNOS 
        cur.execute("""
            SELECT id_turno, hora_inicio
            FROM turno
            WHERE id_turno = %s;
        """, (request.id_turno,))

        turno_info = cur.fetchone()
        if not turno_info:
            return {"error": "El turno no existe"}

        # NO PERMITIR RESERVAR TURNOS PASADOS HO
        if not es_bibliotecario and fecha_reserva == hoy:
            hora_actual = datetime.now().time()
            hora_turno = turno_info["hora_inicio"]

            if isinstance(hora_turno, timedelta):
                hora_turno = (datetime.min + hora_turno).time()
            else:
                hora_turno = datetime.strptime(str(hora_turno), "%H:%M:%S").time()

            if hora_actual >= hora_turno:
                return {"error": "Ese turno ya pasó hoy"}

        # REGLAS TIPO DE SALA (solo usuario)
        if not es_bibliotecario:

            # SALA POSGRADO
            if sala["tipo_sala"] == "posgrado":
                cur.execute("""
                    SELECT 1
                    FROM participante_programa_academico 
                    WHERE ci_participante = %s AND rol = 'docente';
                """, (ci,))
                if cur.fetchone():
                    return {"error": "Los docentes no pueden reservar salas de posgrado"}

                cur.execute("""
                    SELECT 1
                    FROM participante_programa_academico ppa
                    JOIN programa_academico pa ON ppa.nombre_programa = pa.nombre_programa
                    WHERE ppa.ci_participante = %s AND pa.tipo = 'posgrado';
                """, (ci,))
                if not cur.fetchone():
                    return {"error": "Solo estudiantes de posgrado pueden reservar"}

            # SALA DOCENTE
            if sala["tipo_sala"] == "docente":
                cur.execute("""
                    SELECT 1
                    FROM participante_programa_academico
                    WHERE ci_participante = %s AND rol = 'docente';
                """, (ci,))
                if not cur.fetchone():
                    return {"error": "Solo docentes pueden reservar esta sala"}

        #  LIMITE SEMANAL (solo usuario) 
        if not es_bibliotecario:
            cur.execute("""
                SELECT COUNT(*) AS cantidad_reservas
                FROM reserva r
                JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
                WHERE YEARWEEK(r.fecha, 1) = YEARWEEK(%s, 1)
                AND rp.ci_participante = %s
                AND r.estado != 'cancelada';
            """, (request.fecha, ci))

            row = cur.fetchone()
            if row["cantidad_reservas"] >= 3:
                return {"error": "Ya tenés 3 reservas esta semana"}

        # CHEQUEAR DOBLE RESERVA
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

        # SANCIONES (solo usuario) 
        if not es_bibliotecario:
            cur.execute("""
                SELECT 1 
                FROM sancion_participante
                WHERE ci_participante = %s
                AND CURDATE() BETWEEN fecha_inicio AND fecha_fin;
            """, (ci,))
            if cur.fetchone():
                return {"error": "Estás sancionado, no podés reservar"}

        # CREAR RESERVA 
        cur.execute("""
            INSERT INTO reserva (nombre_sala, edificio, fecha, id_turno, estado, creador) 
            VALUES (%s, %s, %s, %s, 'activa', %s);
        """, (request.nombre_sala, request.edificio, request.fecha, request.id_turno, ci))

        cn.commit()
        id_reserva = cur.lastrowid

        # CREAR PARTICIPANTES 
        cur.execute("""
            INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, estado_invitacion) 
            VALUES (%s, %s, FALSE, 'creador');
        """, (ci, id_reserva))

        for invitado in request.participantes:
            cur.execute("""
                INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, estado_invitacion)
                VALUES (%s, %s, FALSE, 'pendiente');
            """, (invitado, id_reserva))

            createNotification(
                invitado,
                "invitacion",
                f"Fuiste invitado por {ci} a una reserva en {request.nombre_sala} el día {request.fecha}",
                referencia_tipo="reserva",
                referencia_id=id_reserva
            )

        cn.commit()

        return {
            "mensaje": "Reserva creada correctamente",
            "id_reserva": id_reserva
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass
