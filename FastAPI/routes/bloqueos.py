from fastapi import APIRouter, Depends
from pydantic import BaseModel
from db.connector import getConnection
from core.security import currentUser

router = APIRouter()


class BlockRequest(BaseModel):
    ci_bloqueado: int


@router.post("/bloqueos/block")
def block_user(request: BlockRequest, user=Depends(currentUser)):
    try:
        roleDb = user["rol"]
        ci = user["ci"]

        cn = getConnection(roleDb)
        cur = cn.cursor()

        # verificamos si el usuario que queremos bloquear existe
        consult = cn.cursor(dictionary=True)
        consult.execute("SELECT ci FROM participante WHERE ci = %s", (request.ci_bloqueado,))
        if not consult.fetchone():
            cn.close()
            return {"error": "No existe el participante a bloquear"}

        # insertar el bloqueo, si ya existe no hace nada
        cur.execute("INSERT IGNORE INTO bloqueos (ci_bloqueador, ci_bloqueado) VALUES (%s, %s)", (ci, request.ci_bloqueado))

        # Marcar invitaciones pendientes que provengan del usuario bloqueado hacia quien bloquea
        # Esto evita que las invitaciones existentes sigan apareciendo en /invitaciones/pendientes
        try:
            cur.execute(
                """
                UPDATE reserva_participante rp
                JOIN reserva r ON rp.id_reserva = r.id_reserva
                SET rp.estado_invitacion = 'bloqueada'
                WHERE rp.ci_participante = %s
                  AND r.creador = %s
                  AND rp.estado_invitacion = 'pendiente'
                  AND r.estado = 'activa'
                """,
                (ci, request.ci_bloqueado),
            )
        except Exception:
            # no bloquear la inserción si el update falla
            pass

        cn.commit()
        cn.close()
        return {"mensaje": "Usuario bloqueado", "ci_bloqueado": request.ci_bloqueado}

    except Exception as e:
        return {"error": str(e)}


@router.post("/bloqueos/unblock")
def unblock_user(request: BlockRequest, user=Depends(currentUser)):
    try:
        roleDb = user["rol"]
        ci = user["ci"]

        cn = getConnection(roleDb)
        cur = cn.cursor()

        # eliminamos el bloqueo si existe
        cur.execute("DELETE FROM bloqueos WHERE ci_bloqueador = %s AND ci_bloqueado = %s", (ci, request.ci_bloqueado))
        cn.commit()
        cn.close()
        return {"mensaje": "Usuario desbloqueado", "ci_bloqueado": request.ci_bloqueado}

    except Exception as e:
        return {"error": str(e)}


@router.get("/bloqueos")
def list_blocked(user=Depends(currentUser)):
    try:
        roleDb = user["rol"]
        ci = user["ci"]

        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        cur.execute("SELECT b.ci_bloqueado AS ci, p.nombre, p.apellido, b.fecha_bloqueo FROM bloqueos b JOIN participante p ON b.ci_bloqueado = p.ci WHERE b.ci_bloqueador = %s", (ci,))
        bloqueos = cur.fetchall()
        cn.close()
        return {"total": len(bloqueos), "bloqueados": bloqueos}

    except Exception as e:
        return {"error": str(e)}
