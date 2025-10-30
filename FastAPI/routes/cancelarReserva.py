from fastapi import APIRouter
from db.connector import getConnection
from pydantic import BaseModel

router = APIRouter()

class CancelReservationRequest(BaseModel):
    id_reserva: int

@router.patch("/cancelarReserva")
def cancelar_reserva(request: CancelReservationRequest):
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        ci = 12345678  #CI fijo para pruebas (luego será user["ci"])

        # Verifico que la reserva exista y esté asociada al participante
        cur.execute("""
            SELECT r.id_reserva, r.estado
            FROM reserva r
            JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE r.id_reserva = %s AND rp.ci_participante = %s;
        """, (request.id_reserva, ci))

        reserva = cur.fetchone()
        if not reserva:
            return {"error": "No se encontró una reserva asociada al participante"}

        # Se verifica que la reserva esté activa
        if reserva["estado"] != "activa":
            return {"error": f"La reserva no puede cancelarse porque su estado actual es '{reserva['estado']}'"}

        # Cancelo la reserva
        cur.execute("""
            UPDATE reserva
            SET estado = 'cancelada'
            WHERE id_reserva = %s;
        """, (request.id_reserva,))
        cn.commit()

        return {"mensaje": f"Reserva {request.id_reserva} cancelada exitosamente"}

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass
