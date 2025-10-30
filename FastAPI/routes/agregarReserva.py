from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser
from pydantic import BaseModel

router = APIRouter()

class ReservationRequest(BaseModel):
    nombre_sala: str
    edificio: str
    fecha: str  # Formato 'YYYY-MM-DD'
    id_turno: int

#El base model lo que hace es definir el esquema del request q se espera y valido los tipos de datos e intenta convertirlos a tipos datos

@router.post("/reservar")
def reservar(request: ReservationRequest):
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        ci = 33333333  # CI que exista en tu tabla participante
        
        
        #Sala y edificio existentes ANDA
        cur.execute("""
            SELECT 
                s.nombre_sala, s.edificio, s.tipo_sala
            FROM sala s
            WHERE s.nombre_sala = %s AND s.edificio = %s;
        """, (request.nombre_sala, request.edificio))

        sala = cur.fetchone()
        if not sala:
            return {"error": "No se encontró la sala o edificio especificado"}
        
        #ID turno existente ANDA
        
        cur.execute("""
            SELECT 
                id_turno
            FROM turno t
            WHERE t.id_turno = %s;
        """, (request.id_turno,))

        resp = cur.fetchall()
        if not resp:
            return {"error": "No se encontró el turno especificado"}
        
        #Verificar tipo de sala y tipo del participante ANDA

        if sala['tipo_sala']=='posgrado':
            cur.execute("""
                SELECT 
                    pa.tipo
                FROM participante_programa_academico ppa
                join programa_academico pa on (ppa.nombre_programa=pa.nombre_programa)  
                WHERE ppa.ci_participante = %s AND pa.tipo='posgrado';
            """, (ci,))

            resp = cur.fetchall()
            if not resp:
                return {"error": "El participante no tiene permiso para reservar esta sala"}
            
        elif sala['tipo_sala']=='docente':
            cur.execute("""
                SELECT 
                    ppa.rol
                FROM participante_programa_academico ppa
                WHERE ppa.ci_participante = %s AND ppa.rol='docente';
            """, (ci,))

            resp = cur.fetchall()
            if not resp:
                return {"error": "El participante no tiene permiso para reservar esta sala"}
            
        #Verificar si la sala ya está reservada en la fecha y turno 
            
        cur.execute("""
            SELECT 
                r.id_reserva
                    FROM reserva r
                    WHERE r.nombre_sala = %s AND r.edificio = %s
                    AND r.fecha = %s AND r.id_turno = %s
            """, (request.nombre_sala, request.edificio, request.fecha, request.id_turno))
        
        resp = cur.fetchall()
        if resp:
            return {"error": "La sala ya se encuentra reservada en la fecha y turno especificados"}
        
        #Verificar si el participante está sancionado ANDA

        cur.execute("""
                    select s.ci_participante 
                    from sancion_participante as s
                    where s.ci_participante=%s
                    and CURDATE() between s.fecha_inicio and s.fecha_fin;
                """, (ci,))
        resp = cur.fetchall()
        if resp:
            return {"error": "El participante se encuentra sancionado y no puede realizar reservas"}

        #Ya tiene 3 reservas esta semana
        cur.execute("""
            SELECT 
                COUNT(r.id_reserva) AS cantidad_reservas
            FROM reserva r
            JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE DATEDIFF(CURRENT_DATE, DATE(r.fecha)) <= 7
            AND rp.ci_participante = %s
            AND r.estado!='cancelada';
        """, (ci,))
        resp = cur.fetchone()
        if resp['cantidad_reservas'] >= 3:
            return {"error": "El participante ya tiene 3 reservas en la semana actual"}
        #Hago la reserva
        cur.execute("""
            INSERT INTO reserva ( nombre_sala, edificio, fecha, id_turno, estado, created_at) 
            VALUES (%s, %s, %s, %s, 'activa', NOW());
        """, (request.nombre_sala, request.edificio, request.fecha, request.id_turno))
        cn.commit()
        id_reserva = cur.lastrowid
        #Asocio el participante a la reserva
        cur.execute("""
            INSERT INTO reserva_participante ( ci_participante, id_reserva, asistencia, created_at) 
            VALUES (%s, %s, TRUE, NOW());
        """, (ci, id_reserva))
        cn.commit()
        return {"mensaje": "Reserva realizada con éxito", "id_reserva": id_reserva}
    

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass
