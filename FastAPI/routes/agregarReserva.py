from fastapi import APIRouter, Depends
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

#Solamente Usuario
@router.post("/reservar")
def reservar(request: ReservationRequest, user=Depends(requireRole("Usuario"))):
    try:
        roleDb = user["rol"]
        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        # CI del usuario autenticado 
        ci = user["ci"]

        # Ver que el usuario no haya reservado ya 2 veces en ese dia
        cur.execute(
            """
            SELECT COUNT(*) AS reservas_diarias
            FROM reserva r
            JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE rp.ci_participante = %s AND r.fecha = %s
            AND r.estado != 'cancelada';
            """,
            (ci, request.fecha)
        )

        row = cur.fetchone()
        if row and row["reservas_diarias"] >= 2:
            return {"error": "Ya reservaste 2 horas en este día"}

        
        # Sala y edificio existentes, ver si la sala está habilitada
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
        
        # Bloquear si la sala está deshabilitada
        if sala["habilitada"] == 0:
            return {"error": "La sala no está habilitada para reservas en este momento"}
        

        # Verificar que los participantes existan
        for participanteCi in request.participantes:
            cur.execute("SELECT ci FROM participante WHERE ci = %s", (participanteCi,))
            if not cur.fetchone():
                return {"error": f"El participante con CI {participanteCi} no existe en la base de datos"}
            
        # Verificar que la cantidad de participantes no supere el límite de la sala
        capacidad_maxima = sala['capacidad']
        total_participantes = 1 + len(request.participantes)

        if total_participantes > capacidad_maxima:
            return {"error": "La cantidad de participantes excede la capacidad máxima de la sala"}
        
        # Verificar ID turno
        cur.execute("""
            SELECT id_turno, hora_inicio
            FROM turno t
            WHERE t.id_turno = %s;
        """, (request.id_turno,))

        resp = cur.fetchone()
        if not resp:
            return {"error": "No se encontró el turno especificado"}


        # VALIDAR QUE HOY NO RESERVE TURNOS QUE YA PASARON
        hoy = datetime.now().date()

        if request.fecha == hoy.strftime("%Y-%m-%d"):
            hora_actual = datetime.now().time()
            hora_turno = resp["hora_inicio"]

            # Convertir TIME MySQL -> time
            if isinstance(hora_turno, timedelta):
                hora_turno = (datetime.min + hora_turno).time()
            elif isinstance(hora_turno, str):
                hora_turno = datetime.strptime(hora_turno, "%H:%M:%S").time()

            if hora_actual > hora_turno:
                return {"error": "No podés reservar un turno que ya pasó hoy."}



        # DETERMINAR SI ESTE USUARIO TIENE EXCEPCIÓN DE LÍMITES
        es_excepcion = False

        # Sala de posgrado → excepción solo si es posgrado o docente
        if sala['tipo_sala'] == 'posgrado':
            cur.execute("""
                SELECT pa.tipo
                FROM participante_programa_academico ppa
                JOIN programa_académico pa ON ppa.nombre_programa = pa.nombre_programa
                WHERE ppa.ci_participante = %s AND pa.tipo = 'posgrado';
            """, (ci,))
            if cur.fetchone():
                es_excepcion = True

            # Un docente también puede reservar sala de posgrado sin límites
            if not es_excepcion:
                cur.execute("""
                    SELECT 1
                    FROM participante_programa_academico
                    WHERE ci_participante = %s AND rol = 'docente';
                """, (ci,))
                if cur.fetchone():
                    es_excepcion = True
        
        # Sala de docente -> excepción solo si es docente
        elif sala['tipo_sala'] == 'docente':
            cur.execute("""
                SELECT 1
                FROM participante_programa_academico
                WHERE ci_participante = %s AND rol = 'docente';
            """, (ci,))
            if cur.fetchone():
                es_excepcion = True


        # Verificar tipo de sala y tipo del participante (permisos normales)
        if sala['tipo_sala'] == 'posgrado' and not es_excepcion:
            return {"error": "El participante no tiene permiso para reservar esta sala"}
            
        elif sala['tipo_sala'] == 'docente' and not es_excepcion:
            return {"error": "El participante no tiene permiso para reservar esta sala"}
            
        # Verificar si la sala ya está reservada y activa
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

        
        # Verificar si el participante está sancionado
        cur.execute("""
            SELECT s.ci_participante 
            FROM sancion_participante AS s
            WHERE s.ci_participante = %s
            AND CURDATE() BETWEEN s.fecha_inicio AND s.fecha_fin;
        """, (ci,))
        
        resp3 = cur.fetchall()
        if resp3:
            return {"error": "El participante se encuentra sancionado y no puede realizar reservas"}


        # VALIDACIÓN: NO MÁS DE 3 RESERVAS POR SEMANA
        #    (SOLO SI NO ES EXCEPCIÓN)
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
            if resp4['cantidad_reservas'] >= 3:
                return {"error": "Ya tenés 3 reservas esta semana"}


        # Crear la reserva (incluyendo creador)
        cur.execute("""
            INSERT INTO reserva (nombre_sala, edificio, fecha, id_turno, estado, creador) 
            VALUES (%s, %s, %s, %s, 'activa', %s);
        """, (request.nombre_sala, request.edificio, request.fecha, request.id_turno, ci))

        cn.commit()
        id_reserva = cur.lastrowid

        # Asociar participante principal (creador)
        cur.execute("""
            INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, estado_invitacion) 
            VALUES (%s, %s, FALSE, 'creador');
        """, (ci, id_reserva))

        cn.commit()

        # Asociar otros participantes
        for ci_participantes in request.participantes:
            cur.execute("""
                INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, estado_invitacion)
                VALUES (%s, %s, FALSE, 'pendiente');
            """, (ci_participantes, id_reserva))

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
