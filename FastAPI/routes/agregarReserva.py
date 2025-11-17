from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser
from pydantic import BaseModel
from core.security import requireRole 

router = APIRouter()

class ReservationRequest(BaseModel):
    nombre_sala: str
    edificio: str
    fecha: str  # Formato 'YYYY-MM-DD'
    id_turno: int
    participantes: list[int]

#El base model lo que hace es definir el esquema del request q se espera y valido los tipos de datos e intenta convertirlos a tipos datos

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

        
        # Sala y edificio existentes ANDA
        cur.execute("""
            SELECT 
                s.nombre_sala, s.edificio, s.tipo_sala, s.capacidad
            FROM sala s
            WHERE s.nombre_sala = %s AND s.edificio = %s;
        """, (request.nombre_sala, request.edificio))

        sala = cur.fetchone()
        if not sala:
            return {"error": "No se encontró la sala o edificio especificado"}
        

        # Verificar que los participantes existan ANDA
        for participanteCi in request.participantes:
            cur.execute("SELECT ci FROM participante WHERE ci = %s", (participanteCi,))
            if not cur.fetchone():
                return {"error": f"El participante con CI {participanteCi} no existe en la base de datos"}
            
        # Verificar que la cantidad de participantes no supere el límite de la sala
        capacidad_maxima = sala['capacidad']
        total_participantes = 1 + len(request.participantes)  # Incluye al que la

        if total_participantes > capacidad_maxima:
            return {"error": "La cantidad de participantes excede la capacidad máxima de la sala"}
        
        # ID turno existente ANDA
        cur.execute("""
            SELECT 
                id_turno
            FROM turno t
            WHERE t.id_turno = %s;
        """, (request.id_turno,))

        resp = cur.fetchone()
        if not resp:
            return {"error": "No se encontró el turno especificado"}
        
        # Verificar tipo de sala y tipo del participante ANDA

        if sala['tipo_sala'] == 'posgrado':
            cur.execute("""
                SELECT 
                    pa.tipo
                FROM participante_programa_academico ppa
                JOIN programa_academico pa ON (ppa.nombre_programa = pa.nombre_programa)  
                WHERE ppa.ci_participante = %s AND pa.tipo = 'posgrado';
            """, (ci,))

            resp = cur.fetchall()
            if not resp:
                return {"error": "El participante no tiene permiso para reservar esta sala"}
            
        elif sala['tipo_sala'] == 'docente':
            cur.execute("""
                SELECT 
                    ppa.rol
                FROM participante_programa_academico ppa
                WHERE ppa.ci_participante = %s AND ppa.rol = 'docente';
            """, (ci,))

            resp = cur.fetchall()
            if not resp:
                return {"error": "El participante no tiene permiso para reservar esta sala"}
            
        # Verificar si la sala ya está reservada y activa en la fecha y turno 
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

        
        # Verificar si el participante está sancionado ANDA
        cur.execute("""
            SELECT s.ci_participante 
            FROM sancion_participante AS s
            WHERE s.ci_participante = %s
            AND CURDATE() BETWEEN s.fecha_inicio AND s.fecha_fin;
        """, (ci,))
        
        resp = cur.fetchall()
        if resp:
            return {"error": "El participante se encuentra sancionado y no puede realizar reservas"}

        # Ya tiene 3 reservas esta semana
        cur.execute("""
            SELECT 
                COUNT(r.id_reserva) AS cantidad_reservas
            FROM reserva r
            JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE DATEDIFF(CURRENT_DATE, DATE(r.fecha)) <= 7
            AND rp.ci_participante = %s
            AND r.estado != 'cancelada';
        """, (ci,))
        
        resp = cur.fetchone()
        if resp['cantidad_reservas'] >= 3:
            return {"error": "El participante ya tiene 3 reservas en la semana actual"}

        # Hago la reserva
        cur.execute("""
            INSERT INTO reserva (nombre_sala, edificio, fecha, id_turno, estado) 
            VALUES (%s, %s, %s, %s, 'activa');
        """, (request.nombre_sala, request.edificio, request.fecha, request.id_turno))

        cn.commit()
        id_reserva = cur.lastrowid

        # Asocio el participante a la reserva
        cur.execute("""
            INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia) 
            VALUES (%s, %s, FALSE);
        """, (ci, id_reserva))

        cn.commit()

        # Agrego a los otros participantes
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
