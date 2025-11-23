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

        
        # Obtener invitaciones pendientes de un usuario
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
                r.creador,
                r.estado
            FROM reserva_participante AS rp
            JOIN reserva AS r ON rp.id_reserva = r.id_reserva
            JOIN turno AS t ON r.id_turno = t.id_turno
            JOIN participante AS p ON r.creador = p.ci
            WHERE rp.ci_participante = %s 
            AND rp.estado_invitacion = %s
            AND r.estado = 'activa'
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
        
        # Dada una invitación pendiente, cambiar su estado a 'aceptada'
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
        
        # Dada una invitación pendiente, cambiar su estado a 'rechazada'
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
    roleDb = user["rol"]
    ci_user = user.get("ci")
    cn = None
    try:
        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        # Verificar que la reserva exista y checar permisos
        cur.execute(
            "SELECT r.id_reserva, r.nombre_sala, r.edificio, r.creador FROM reserva r WHERE r.id_reserva = %s AND r.estado != 'cancelada'",
            (request.id_reserva,),
        )
        reserva = cur.fetchone()
        if not reserva:
            return {"error": "No se encontró la reserva especificada o está cancelada"}

        role_lower = (user.get("rol") or "").strip().lower()
        if role_lower not in ("administrador", "bibliotecario") and ci_user != reserva.get("creador"):
            return {"error": "No estás autorizado para invitar a esta reserva"}

        # Obtener capacidad de la sala
        cur.execute("SELECT s.capacidad FROM sala s WHERE s.nombre_sala = %s AND s.edificio = %s", (reserva.get("nombre_sala"), reserva.get("edificio")))
        sala = cur.fetchone()
        if not sala:
            return {"error": "No se encontró la sala asociada a la reserva"}
        capacidad = sala.get("capacidad")

        # Contar participantes actuales que aceptaron o están pendientes
        cur.execute(
            "SELECT COUNT(*) AS total FROM reserva_participante rp WHERE rp.id_reserva = %s AND rp.estado_invitacion NOT IN ('rechazada', 'bloqueada')",
            (request.id_reserva,),
        )
        row = cur.fetchone()
        actuales = row.get("total") if row else 0

        # Preparar acciones por participante
        #Las acciones pueden ser 'insert' o 'update' porque puede que ya estén invitados pero rechazaron antes
        actions = []
        errors = []

        for ci_part in request.participantes:
            # verificar existencia en tabla participante
            cur.execute("SELECT ci FROM participante WHERE ci = %s", (ci_part,))
            if not cur.fetchone():
                errors.append({"ci": ci_part, "error": "No existe participante con ese CI"})
                continue

            # Verificar bloqueo a nivel usuario: si el participante bloqueó al que invita, no se puede invitar
            cur.execute("SELECT 1 FROM bloqueos WHERE ci_bloqueador = %s AND ci_bloqueado = %s", (ci_part, ci_user))
            if cur.fetchone():
                errors.append({"ci": ci_part, "error": "No se puede invitar: el usuario te tiene bloqueado"})
                continue

            # verificar si ya hay una entrada en reserva_participante
            cur.execute("SELECT estado_invitacion FROM reserva_participante WHERE id_reserva = %s AND ci_participante = %s", (request.id_reserva, ci_part))
            existing = cur.fetchone()
            estado = existing.get("estado_invitacion") if existing else None
            if estado:
                if estado == 'bloqueada':
                    errors.append({"ci": ci_part, "error": "El usuario bloqueó esta reserva"})
                    continue
                if estado == 'rechazada':
                    actions.append({"ci": ci_part, "action": 'update'})
                    continue
                errors.append({"ci": ci_part, "error": "Ya está en la reserva"})
                continue

            actions.append({"ci": ci_part, "action": 'insert'})

        # Verificar capacidad y aplicar
        
        to_add = len([a for a in actions if a["action"] in ("insert", "update")])
        if actuales + to_add > capacidad:
            return {"error": "La cantidad de participantes excede la capacidad de la sala", "capacidad": capacidad, "actuales": actuales}

        invitados = []
        #por invitados voy modificando el estado participante para mandar la invitación
        #si no lo invité nunca inserto, sino actualizo
        for act in actions:
            ci_part = act["ci"]
            if act["action"] == 'insert':
                cur.execute(
                    "INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, estado_invitacion) VALUES (%s, %s, FALSE, 'pendiente')",
                    (ci_part, request.id_reserva),
                )
                invitados.append(ci_part)
            else:
                cur.execute(
                    "UPDATE reserva_participante SET estado_invitacion = %s WHERE id_reserva = %s AND ci_participante = %s",
                    ('pendiente', request.id_reserva, ci_part),
                )
                invitados.append(ci_part)

        cn.commit()
        return {"mensaje": "Invitaciones enviadas", "id_reserva": request.id_reserva, "invitados": invitados, "errores": errors}

    except Exception as e:
        return {"error": str(e)}

    finally:
        if cn:
            try:
                cn.close()
            except:
                pass



# Bloquear invitaciones de una reserva (el usuario deja de recibir invitaciones de esa reserva)
@router.post("/invitaciones/bloquear")
def blockInvitationEndpoint(request: AcceptRejectRequest, user=Depends(currentUser)):
    try:
        roleDb = user["rol"]
        ci = user["ci"]

        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        # Verificar que la reserva exista y obtener creador
        cur.execute("SELECT id_reserva, creador FROM reserva WHERE id_reserva = %s", (request.id_reserva,))
        reserva_row = cur.fetchone()
        if not reserva_row:
            cn.close()
            return {"error": "No se encontró la reserva especificada"}
        reserva_creador = reserva_row.get("creador") if isinstance(reserva_row, dict) else reserva_row[1]

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

        # No crea bloqueo global aquí. Bloquea una reserva especifiac
        # solo aplica a esta reserva y NO impide que el creador te invite a otras reservas.

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
    """
    Desbloquea la invitación para el usuario actual.
    Por defecto la acción será convertir la entrada a 'rechazada' para que deje de recibir
    """
    try:
        roleDb = user["rol"]
        ci = user["ci"]

        # determinar acción: por defecto 'rechazar'
        accion = (request.accion or 'rechazar').lower()

        cn = getConnection(roleDb)
        cur = cn.cursor()

        if accion == 'cancelar':
            # verificar permisos: debe ser creador o rol administrador/bibliotecario en caso de querer agregarlo
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

        # desbloquear: cambiar estado a 'rechazada' de manera predeterminada
        cur = cn.cursor(dictionary=True)
        cur.execute("SELECT estado_invitacion FROM reserva_participante WHERE id_reserva = %s AND ci_participante = %s", (request.id_reserva, ci))
        existing = cur.fetchone()
        cur_non_dict = cn.cursor()
        # Si existe, actualizar; sino insertar
        if existing:
            cur_non_dict.execute("UPDATE reserva_participante SET estado_invitacion = %s WHERE id_reserva = %s AND ci_participante = %s", ('rechazada', request.id_reserva, ci))
        else:
            cur_non_dict.execute("INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, estado_invitacion) VALUES (%s, %s, FALSE, 'rechazada')", (ci, request.id_reserva))

        cn.commit()
        cn.close()

        return {"mensaje": "Has desbloqueado la reserva (tu invitación ahora está 'rechazada')", "id_reserva": request.id_reserva, "estado": "rechazada"}

    except Exception as e:
        return {"error": str(e)}
