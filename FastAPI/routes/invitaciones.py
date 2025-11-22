from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser
from pydantic import BaseModel
from core.security import requireRole

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


class InviteByCIRequest(BaseModel):
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


# Invitar por CI a una reserva existente
@router.post("/invitaciones/invitar")
def inviteByCI(request: InviteByCIRequest, user=Depends(currentUser)):
    try:
        roleDb = user["rol"]
        ci_user = user.get("ci")

        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        # Verificar que la reserva exista y obtener sala y creador
        cur.execute("""
            SELECT r.id_reserva, r.nombre_sala, r.edificio, r.creador
            FROM reserva r
            WHERE r.id_reserva = %s AND r.estado != 'cancelada'
        """, (request.id_reserva,))

        reserva = cur.fetchone()
        if not reserva:
            return {"error": "No se encontró la reserva especificada o está cancelada"}

        # Permisos: el creador puede invitar; además Administrador y Bibliotecario pueden hacerlo
        role_lower = (user.get("rol") or "").strip().lower()
        if role_lower not in ("administrador", "bibliotecario"):
            # debe ser el creador
            if ci_user != reserva["creador"]:
                return {"error": "No estás autorizado para invitar a esta reserva"}

        # Obtener capacidad de la sala
        cur.execute("""
            SELECT s.capacidad
            FROM sala s
            WHERE s.nombre_sala = %s AND s.edificio = %s
        """, (reserva["nombre_sala"], reserva["edificio"]))

        sala = cur.fetchone()
        if not sala:
            return {"error": "No se encontró la sala asociada a la reserva"}

        capacidad = sala["capacidad"]

        # Contar participantes actuales (no contar invitaciones rechazadas)
        cur.execute("""
            SELECT COUNT(*) AS total
            FROM reserva_participante rp
            WHERE rp.id_reserva = %s AND rp.estado_invitacion != 'rechazada'
        """, (request.id_reserva,))

        row = cur.fetchone()
        actuales = row["total"] if row else 0

        # Validar existencia y duplicados
        valid_to_invite = []
        errors = []

        for ci_part in request.participantes:
            # verificar existencia en tabla participante
            cur.execute("SELECT ci FROM participante WHERE ci = %s", (ci_part,))
            if not cur.fetchone():
                errors.append({"ci": ci_part, "error": "No existe participante con ese CI"})
                continue

            # verificar si ya está invitado/participando
            cur.execute("SELECT 1 FROM reserva_participante WHERE id_reserva = %s AND ci_participante = %s", (request.id_reserva, ci_part))
            if cur.fetchone():
                errors.append({"ci": ci_part, "error": "Ya está en la reserva"})
                continue

            valid_to_invite.append(ci_part)

        # Verificar capacidad
        if actuales + len(valid_to_invite) > capacidad:
            return {"error": "La cantidad de participantes excede la capacidad de la sala", "capacidad": capacidad, "actuales": actuales}

        # Insertar invitaciones
        for ci_part in valid_to_invite:
            cur.execute("""
                INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, estado_invitacion)
                VALUES (%s, %s, FALSE, 'pendiente')
            """, (ci_part, request.id_reserva))

        cn.commit()

        cn.close()

        return {
            "mensaje": "Invitaciones enviadas",
            "id_reserva": request.id_reserva,
            "invitados": valid_to_invite,
            "errores": errors
        }

    except Exception as e:
        return {"error": str(e)}
