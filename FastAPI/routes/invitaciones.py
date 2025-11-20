from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser
from pydantic import BaseModel

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
