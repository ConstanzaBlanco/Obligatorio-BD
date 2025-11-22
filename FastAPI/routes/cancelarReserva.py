from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from pydantic import BaseModel
from core.security import requireRole
from db.notificationSentences import createNotification

router = APIRouter()

class CancelReservationRequest(BaseModel):
    id_reserva: int

@router.patch("/cancelarReserva")
def cancelar_reserva(request: CancelReservationRequest, user=Depends(requireRole("Usuario"))):
    try:
        roleDb = user["rol"]
        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        # CI del usuario autenticado
        ci = user["ci"]

        # Obtener reserva + datos importantes
        cur.execute("""
            SELECT r.id_reserva, r.estado, r.fecha, t.hora_inicio, 
                   r.creador, r.nombre_sala, r.edificio
            FROM reserva r
            JOIN turno t ON t.id_turno = r.id_turno
            WHERE r.id_reserva = %s;
        """, (request.id_reserva,))

        reserva = cur.fetchone()
        if not reserva:
            raise HTTPException(404, "No se encontró una reserva asociada al participante")

        if reserva["estado"] != "activa":
            raise HTTPException(400, f"No se puede cancelar porque la reserva está '{reserva['estado']}'")

        if reserva["creador"] != ci:
            raise HTTPException(403, "Solo el creador puede cancelar la reserva")

        # Hora actual
        cur.execute("SELECT NOW() AS now")
        now = cur.fetchone()["now"]

        if str(reserva["fecha"]) < str(now.date()):
            raise HTTPException(400, "No se puede cancelar una reserva pasada")

        if str(reserva["fecha"]) == str(now.date()) and str(reserva["hora_inicio"]) <= str(now.time()):
            raise HTTPException(400, "La reserva ya empezó, no puede cancelarse")

        # --- CANCELAR ---
        cur.execute("""
            UPDATE reserva
            SET estado = 'cancelada'
            WHERE id_reserva = %s;
        """, (request.id_reserva,))
        cn.commit()

        # Notificación para el creador
        createNotification(
            ci,
            "reserva_cancelada",
            f"Cancelaste la reserva {request.id_reserva} en la sala {reserva['nombre_sala']} "
            f"({reserva['edificio']}) para el día {reserva['fecha']}.",
            referencia_tipo="reserva",
            referencia_id=request.id_reserva
        )

        # OBTENER INVITADOS QUE ACEPTARON
        cur.execute("""
            SELECT rp.ci_participante, p.nombre
            FROM reserva_participante rp
            JOIN participante p ON p.ci = rp.ci_participante
            WHERE rp.id_reserva = %s
            AND rp.estado_invitacion = 'aceptada'
        """, (request.id_reserva,))

        invitados = cur.fetchall()

        # NOTIFICAR A CADA INVITADO QUE ACEPTÓ
        for invitado in invitados:
            createNotification(
                invitado["ci_participante"],
                "RESERVA CANCELADA",
                f"La reserva {request.id_reserva} en la sala {reserva['nombre_sala']} "
                f"({reserva['edificio']}) para el día {reserva['fecha']} fue cancelada por el creador.",
                referencia_tipo="reserva",
                referencia_id=request.id_reserva
            )

        return {"mensaje": f"Reserva {request.id_reserva} cancelada y notificaciones enviadas"}

    except HTTPException:
        raise

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cur.close()
            cn.close()
        except:
            pass
