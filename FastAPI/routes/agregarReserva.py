from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import currentUser
from pydantic import BaseModel
from core.security import requireRole
from datetime import datetime, timedelta, time

router = APIRouter()

class ReservationRequest(BaseModel):
    nombre_sala: str
    edificio: str
    fecha: str  # Formato 'YYYY-MM-DD'
    id_turno: int
    participantes: list[int]

# Solamente Usuario
@router.post("/reservar")
def reservar(request: ReservationRequest, user=Depends(requireRole("Usuario"))):
    try:
        roleDb = user["rol"]
        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        # CI del usuario autenticado 
        ci = user["ci"]

        # VALIDAR 2 RESERVAS POR DÍA
        cur.execute(
            """
            SELECT COUNT(*) AS reservas_diarias
            FROM reserva r
            JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE rp.ci_participante = %s 
              AND r.fecha = %s
              AND r.estado = 'activa';
            """,
            (ci, request.fecha)
        )
        row = cur.fetchone()
        if row and row["reservas_diarias"] >= 2:
            return {"error": "Ya reservaste 2 horas en este día"}

        # VALIDAR SALA Y EDIFICIO EXISTENTE 
        cur.execute("""
            SELECT 
                s.nombre_sala, 
                s.edificio, 
                s.tipo_sala, 
                s.capacidad,
                s.habilitada
            FROM sala s
            WHERE s.nombre_sala = %s AND s.edificio = %s;
        """, (request.nombre_sala, request.edificio))

        sala = cur.fetchone()
        if not sala:
            return {"error": "No se encontró la sala o edificio especificado"}

        # VALIDAR EDIFICIO HABILITADO
        cur.execute("""
            SELECT habilitado
            FROM edificio
            WHERE nombre_edificio = %s
        """, (request.edificio,))

        edif = cur.fetchone()
        if not edif:
            return {"error": "El edificio no existe"}

        if edif["habilitado"] == 0:
            return {"error": "El edificio no está habilitado para reservas en este momento"}

        # BLOQUEAR SI LA SALA ESTÁ DESHABILITADA
        if sala["habilitada"] == 0:
            return {"error": "La sala no está habilitada para reservas en este momento"}

        # VALIDAR PARTICIPANTES
        for participanteCi in request.participantes:
            cur.execute("SELECT ci FROM participante WHERE ci = %s", (participanteCi,))
            if not cur.fetchone():
                return {"error": f"El participante con CI {participanteCi} no existe"}

        # VALIDAR CAPACIDAD
        capacidad_maxima = sala['capacidad']
        total_participantes = 1 + len(request.participantes)
        if total_participantes > capacidad_maxima:
            return {"error": "La cantidad de participantes excede la capacidad de la sala"}

        # VALIDAR TURNO
        cur.execute("""
            SELECT hora_inicio
            FROM turno
            WHERE id_turno = %s;
        """, (request.id_turno,))

        turno_data = cur.fetchone()
        if not turno_data:
            return {"error": "No se encontró el turno especificado"}

        # VALIDAR QUE NO RESERVE UN TURNO QUE YA PASÓ HOY
        hoy = datetime.now().date()

        if request.fecha == hoy.strftime("%Y-%m-%d"):
            hora_actual = datetime.now().time()
            hora_turno = turno_data["hora_inicio"]

            # Normalización del tipo TIME
            if isinstance(hora_turno, timedelta):
                hora_turno = (datetime.min + hora_turno).time()
            elif isinstance(hora_turno, str):
                hora_turno = datetime.strptime(hora_turno, "%H:%M:%S").time()
            elif not isinstance(hora_turno, time):
                return {"error": "Error interno: formato de hora inválido"}

            if hora_actual > hora_turno:
                return {"error": "No podés reservar un turno que ya pasó en el día de hoy."}

        # VALIDAR TIPO DE SALA
        es_excepcion = False

        if sala['tipo_sala'] == 'posgrado':
            cur.execute("""
                SELECT pa.tipo
                FROM participante_programa_academico ppa
                JOIN programa_academico pa ON ppa.nombre_programa = pa.nombre_programa
                WHERE ppa.ci_participante = %s AND pa.tipo = 'posgrado';
            """, (ci,))
            if cur.fetchone():
                es_excepcion = True
            else:
                return {"error": "No tenés permiso para reservar una sala de posgrado"}

        elif sala['tipo_sala'] == 'docente':
            cur.execute("""
                SELECT 1
                FROM participante_programa_academico
                WHERE ci_participante = %s AND rol = 'docente';
            """, (ci,))
            if cur.fetchone():
                es_excepcion = True
            else:
                return {"error": "No tenés permiso para reservar una sala de docentes"}

        # VALIDAR QUE LA SALA NO ESTÉ RESERVADA
        cur.execute("""
            SELECT estado
            FROM reserva
            WHERE nombre_sala = %s 
              AND edificio = %s
              AND fecha = %s 
              AND id_turno = %s;
        """, (request.nombre_sala, request.edificio, request.fecha, request.id_turno))

        reserva_existente = cur.fetchone()
        if reserva_existente and reserva_existente["estado"] == "activa":
            return {"error": "La sala ya está reservada en esa fecha y turno"}

        # VALIDAR SANCIONES
        cur.execute("""
            SELECT 1
            FROM sancion_participante
            WHERE ci_participante = %s
              AND CURDATE() BETWEEN fecha_inicio AND fecha_fin;
        """, (ci,))
        if cur.fetchone():
            return {"error": "Estás sancionado y no podés reservar"}

        # VALIDAR MÁXIMO 3 RESERVAS EN LA SEMANA
        if not es_excepcion:
            cur.execute("""
                SELECT COUNT(*) AS cantidad_reservas
                FROM reserva r
                JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
                WHERE YEARWEEK(r.fecha, 1) = YEARWEEK(%s, 1)
                  AND rp.ci_participante = %s
                  AND r.estado = 'activa';
            """, (request.fecha, ci))
            resp = cur.fetchone()
            if resp['cantidad_reservas'] >= 3:
                return {"error": "Ya tenés 3 reservas activas en esta semana."}

        # CREAR RESERVA
        cur.execute("""
            INSERT INTO reserva (nombre_sala, edificio, fecha, id_turno, estado) 
            VALUES (%s, %s, %s, %s, 'activa');
        """, (request.nombre_sala, request.edificio, request.fecha, request.id_turno))

        cn.commit()
        id_reserva = cur.lastrowid

        # Asociar al usuario principal
        cur.execute("""
            INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia) 
            VALUES (%s, %s, FALSE);
        """, (ci, id_reserva))
        cn.commit()

        # Participantes adicionales
        for ci_participantes in request.participantes:
            cur.execute("""
                INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia)
                VALUES (%s, %s, FALSE);
            """, (ci_participantes, id_reserva))

        cn.commit()

        return {
            "mensaje": "Reserva creada correctamente",
            "id_reserva": id_reserva,
            "participantes_totales": [ci] + request.participantes
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass
