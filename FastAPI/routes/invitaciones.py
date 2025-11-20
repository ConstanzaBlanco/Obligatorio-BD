from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser
from pydantic import BaseModel
from fastapi import HTTPException

router = APIRouter()

class InvitationResponse(BaseModel):
    id_reserva: int
    nombre_sala: str
    edificio: str
    fecha: str
    hora_inicio: str
    hora_fin: str
    creador_nombre: str
    creador_apellido: str


class AcceptRejectRequest(BaseModel):
    id_reserva: int


class InviteRequest(BaseModel):
    id_reserva: int
    participantes: list[int]


# Obtener todas las invitaciones pendientes del usuario actual
@router.get("/invitaciones/pendientes")
def getPendingInvitationsList(user=Depends(currentUser)):
    try:
        roleDb = user["rol"]
        ci = user["ci"]
        
        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)
        
        cur.execute("""
            SELECT 
                rp.id_reserva,
                rp.ci_participante,
                rp.estado_invitacion,
                r.nombre_sala,
                r.edificio,
                r.fecha,
                t.id_turno,
                t.hora_inicio,
                t.hora_fin,
                p.nombre AS creador_nombre,
                p.apellido AS creador_apellido,
                r.creador
            FROM reserva_participante AS rp
            JOIN reserva AS r ON rp.id_reserva = r.id_reserva
            JOIN turno AS t ON r.id_turno = t.id_turno
            JOIN participante AS p ON r.creador = p.ci
            WHERE rp.ci_participante = %s 
            AND rp.estado_invitacion = %s
            ORDER BY r.fecha, t.hora_inicio
        """, (ci, 'pendiente'))
        
        invitations = cur.fetchall()
        cn.close()
        
        if not invitations:
            return {
                "total": 0,
                "invitaciones": [],
                "mensaje": "No tienes invitaciones pendientes"
            }
        
        return {
            "total": len(invitations),
            "invitaciones": invitations
        }
    
    except Exception as e:
        return {"error": str(e)}


# Invitar participantes a una reserva (solo creador)
@router.post("/invitaciones/invitar")
def inviteParticipants(request: InviteRequest, user=Depends(currentUser)):
    try:
        roleDb = user["rol"]
        ci = user["ci"]

        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        # Verificar que la reserva exista y obtener datos (sala, edificio, creador, capacidad)
        cur.execute("""
            SELECT r.id_reserva, r.creador, r.nombre_sala, r.edificio, s.capacidad
            FROM reserva r
            JOIN sala s ON r.nombre_sala = s.nombre_sala AND r.edificio = s.edificio
            WHERE r.id_reserva = %s AND r.estado = 'activa'
        """, (request.id_reserva,))

        reserva = cur.fetchone()
        if not reserva:
            raise HTTPException(status_code=404, detail="Reserva no encontrada o no activa")

        # Solo el creador puede invitar
        if reserva["creador"] != ci:
            raise HTTPException(status_code=403, detail="Solo el creador puede invitar participantes")

        capacidad = reserva["capacidad"]

        # Normalizar lista de CIs y quitar duplicados y al creador
        requested = list(dict.fromkeys(request.participantes))
        requested = [p for p in requested if p != ci]

        if len(requested) == 0:
            return {"mensaje": "No hay participantes válidos para invitar", "invitados": []}

        # Verificar existencia de participantes y eliminar los que ya están en la reserva
        valid_to_insert = []
        for participante_ci in requested:
            cur.execute("SELECT ci FROM participante WHERE ci = %s", (participante_ci,))
            if not cur.fetchone():
                continue

            cur.execute("SELECT ci_participante FROM reserva_participante WHERE id_reserva = %s AND ci_participante = %s", (request.id_reserva, participante_ci))
            if cur.fetchone():
                # ya estaba asociado (evitamos duplicados)
                continue

            valid_to_insert.append(participante_ci)

        if not valid_to_insert:
            return {"mensaje": "Ningún participante nuevo válido para invitar", "invitados": []}

        # Contar participantes actuales (no rechazados) para chequear capacidad
        cur.execute("SELECT COUNT(*) AS total FROM reserva_participante WHERE id_reserva = %s AND estado_invitacion != 'rechazada'", (request.id_reserva,))
        total_actual = cur.fetchone()["total"]

        if total_actual + len(valid_to_insert) > capacidad:
            raise HTTPException(status_code=400, detail="La cantidad de invitados excede la capacidad de la sala")

        # Insertar las invitaciones pendientes
        for ci_new in valid_to_insert:
            cur.execute("INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, estado_invitacion) VALUES (%s, %s, FALSE, 'pendiente')", (ci_new, request.id_reserva))

        cn.commit()
        cn.close()

        return {"mensaje": "Invitaciones enviadas", "invitados": valid_to_insert}

    except HTTPException:
        raise

    except Exception as e:
        return {"error": str(e)}


# Aceptar una invitación
@router.post("/invitaciones/aceptar")
def acceptInvitationEndpoint(request: AcceptRejectRequest, user=Depends(currentUser)):
    try:
        roleDb = user["rol"]
        ci = user["ci"]
        
        cn = getConnection(roleDb)
        cur = cn.cursor()
        
        cur.execute("""
            UPDATE reserva_participante 
            SET estado_invitacion = %s
            WHERE ci_participante = %s AND id_reserva = %s AND estado_invitacion = %s
        """, ('aceptada', ci, request.id_reserva, 'pendiente'))
        
        cn.commit()
        result = cur.rowcount
        cn.close()
        
        if result == 0:
            return {
                "error": "No se encontró la invitación pendiente o ya fue procesada"
            }
        
        return {
            "mensaje": "Invitación aceptada correctamente",
            "id_reserva": request.id_reserva,
            "estado": "aceptada"
        }
    
    except Exception as e:
        return {"error": str(e)}


# Rechazar una invitación
@router.post("/invitaciones/rechazar")
def rejectInvitationEndpoint(request: AcceptRejectRequest, user=Depends(currentUser)):
    try:
        roleDb = user["rol"]
        ci = user["ci"]
        
        cn = getConnection(roleDb)
        cur = cn.cursor()
        
        cur.execute("""
            UPDATE reserva_participante 
            SET estado_invitacion = %s
            WHERE ci_participante = %s AND id_reserva = %s AND estado_invitacion = %s
        """, ('rechazada', ci, request.id_reserva, 'pendiente'))
        
        cn.commit()
        result = cur.rowcount
        cn.close()
        
        if result == 0:
            return {
                "error": "No se encontró la invitación pendiente o ya fue procesada"
            }
        
        return {
            "mensaje": "Invitación rechazada correctamente",
            "id_reserva": request.id_reserva,
            "estado": "rechazada"
        }
    
    except Exception as e:
        return {"error": str(e)}
