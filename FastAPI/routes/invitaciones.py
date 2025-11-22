from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser
from pydantic import BaseModel
from typing import Optional
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


class UnblockRequest(BaseModel):
    id_reserva: int
    accion: Optional[str] = None


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

        # Contar participantes actuales (no contar invitaciones rechazadas ni bloqueadas)
        cur.execute("""
            SELECT COUNT(*) AS total
            FROM reserva_participante rp
            WHERE rp.id_reserva = %s AND rp.estado_invitacion NOT IN ('rechazada', 'bloqueada')
        """, (request.id_reserva,))

        row = cur.fetchone()
        actuales = row["total"] if row else 0

        # Validar existencia y duplicados. Permitimos re-invitar si el estado actual es 'rechazada'
        actions = []  # list of dicts: {ci: int, action: 'insert'|'update'}
        errors = []

        for ci_part in request.participantes:
            # verificar existencia en tabla participante
            cur.execute("SELECT ci FROM participante WHERE ci = %s", (ci_part,))
            if not cur.fetchone():
                errors.append({"ci": ci_part, "error": "No existe participante con ese CI"})
                continue

            # verificar si ya hay una entrada en reserva_participante
            cur.execute("SELECT estado_invitacion FROM reserva_participante WHERE id_reserva = %s AND ci_participante = %s", (request.id_reserva, ci_part))
            existing = cur.fetchone()
            if existing:
                # cur is dictionary=True at top: existing is dict
                estado = existing.get("estado_invitacion") if isinstance(existing, dict) else (existing[0] if existing else None)
                if estado == 'bloqueada':
                    errors.append({"ci": ci_part, "error": "El usuario bloqueó esta reserva"})
                    continue
                if estado == 'rechazada':
                    actions.append({"ci": ci_part, "action": 'update'})
                    continue
                # estados 'pendiente' o 'aceptada' u otros
                errors.append({"ci": ci_part, "error": "Ya está en la reserva"})
                continue

            actions.append({"ci": ci_part, "action": 'insert'})

        # Verificar capacidad (las acciones 'insert' y 'update' incrementan el aporte de participantes)
        to_add = len([a for a in actions if a["action"] in ('insert', 'update')])
        if actuales + to_add > capacidad:
            return {"error": "La cantidad de participantes excede la capacidad de la sala", "capacidad": capacidad, "actuales": actuales}

        # Aplicar acciones
        invited_list = []
        for a in actions:
            ci_part = a["ci"]
            if a["action"] == 'insert':
                cur.execute("""
                    INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, estado_invitacion)
                    VALUES (%s, %s, FALSE, 'pendiente')
                """, (ci_part, request.id_reserva))
                invited_list.append(ci_part)
            elif a["action"] == 'update':
                cur.execute("""
                    UPDATE reserva_participante SET estado_invitacion = %s
                    WHERE id_reserva = %s AND ci_participante = %s
                """, ('pendiente', request.id_reserva, ci_part))
                invited_list.append(ci_part)

        cn.commit()

        cn.close()

        return {
            "mensaje": "Invitaciones enviadas",
            "id_reserva": request.id_reserva,
            "invitados": invited_list,
            "errores": errors
        }

    except Exception as e:
        return {"error": str(e)}


# Bloquear invitaciones de una reserva (el usuario deja de recibir invitaciones de esa reserva)
@router.post("/invitaciones/bloquear")
def blockInvitationEndpoint(request: AcceptRejectRequest, user=Depends(currentUser)):
    try:
        roleDb = user["rol"]
        ci = user["ci"]

        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        # Verificar que la reserva exista
        cur.execute("SELECT id_reserva FROM reserva WHERE id_reserva = %s", (request.id_reserva,))
        if not cur.fetchone():
            cn.close()
            return {"error": "No se encontró la reserva especificada"}

        # Si ya existe una fila para este usuario y reserva, actualizar a 'bloqueada', sino insertar
        cur.execute("SELECT estado_invitacion FROM reserva_participante WHERE id_reserva = %s AND ci_participante = %s", (request.id_reserva, ci))
        existing = cur.fetchone()
        if existing:
            cur.execute(
                "UPDATE reserva_participante SET estado_invitacion = %s WHERE ci_participante = %s AND id_reserva = %s",
                ('bloqueada', ci, request.id_reserva)
            )
        else:
            cur.execute(
                "INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, estado_invitacion) VALUES (%s, %s, FALSE, 'bloqueada')",
                (ci, request.id_reserva)
            )

        cn.commit()
        cn.close()

        return {
            "mensaje": "Has bloqueado las invitaciones de esta reserva",
            "id_reserva": request.id_reserva,
            "estado": "bloqueada"
        }

    except Exception as e:
        return {"error": str(e)}


@router.post("/invitaciones/desbloquear")
def unblockInvitationEndpoint(request: UnblockRequest, user=Depends(currentUser)):
    """Desbloquea la invitación para el usuario actual.
    Por defecto la acción será convertir la entrada a 'rechazada' para que deje de recibir invitaciones.
    Si se pasa body={'accion':'cancelar'} intentará cancelar la reserva (requiere ser creador o rol admin/bibliotecario).
    """
    try:
        roleDb = user["rol"]
        ci = user["ci"]

        # determinar acción: por defecto 'rechazar'
        accion = (request.accion or 'rechazar').lower()

        cn = getConnection(roleDb)
        cur = cn.cursor()

        if accion == 'cancelar':
            # verificar permisos: debe ser creador o rol administrador/bibliotecario
            cur2 = cn.cursor(dictionary=True)
            cur2.execute("SELECT creador, estado FROM reserva WHERE id_reserva = %s", (request.id_reserva,))
            r = cur2.fetchone()
            if not r:
                cn.close()
                return {"error": "No se encontró la reserva especificada"}

            role_lower = (user.get("rol") or "").strip().lower()
            if role_lower not in ("administrador", "bibliotecario") and user.get("ci") != r.get("creador"):
                cn.close()
                return {"error": "No estás autorizado para cancelar esta reserva"}

            if r.get("estado") == 'cancelada':
                cn.close()
                return {"mensaje": "La reserva ya estaba cancelada", "id_reserva": request.id_reserva}

            cur.execute("UPDATE reserva SET estado = %s WHERE id_reserva = %s", ('cancelada', request.id_reserva))
            cn.commit()
            cn.close()
            return {"mensaje": "Reserva cancelada correctamente", "id_reserva": request.id_reserva, "estado": "cancelada"}

        # Por defecto: cambiar la entrada en reserva_participante a 'rechazada' (desbloquear)
        cur = cn.cursor(dictionary=True)
        cur.execute("SELECT estado_invitacion FROM reserva_participante WHERE id_reserva = %s AND ci_participante = %s", (request.id_reserva, ci))
        existing = cur.fetchone()
        cur_non_dict = cn.cursor()
        if existing:
            cur_non_dict.execute("UPDATE reserva_participante SET estado_invitacion = %s WHERE id_reserva = %s AND ci_participante = %s", ('rechazada', request.id_reserva, ci))
        else:
            cur_non_dict.execute("INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, estado_invitacion) VALUES (%s, %s, FALSE, 'rechazada')", (ci, request.id_reserva))

        cn.commit()
        cn.close()

        return {"mensaje": "Has desbloqueado la reserva (tu invitación ahora está 'rechazada')", "id_reserva": request.id_reserva, "estado": "rechazada"}

    except Exception as e:
        return {"error": str(e)}
