from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from pydantic import BaseModel
from core.security import currentUser  
# Para obtener el usuario autenticado
from core.security import requireRole

router = APIRouter()

class CancelReservationRequest(BaseModel):
    id_reserva: int

@router.patch("/cancelarReserva")
def cancelar_reserva(request: CancelReservationRequest, user=Depends(requireRole("Usuario"))):
    try:
        roleDb = user["rol"]
        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        # Obtener el CI del usuario autenticado 
        ci = user["ci"]  

        # Verifico que la reserva exista y obtener datos (incluye creador)
        cur.execute("""
            SELECT r.id_reserva, r.estado, r.fecha, t.hora_inicio, r.creador
            FROM reserva r
            JOIN turno t ON t.id_turno = r.id_turno
            WHERE r.id_reserva = %s;
        """, (request.id_reserva,))

        reserva = cur.fetchone()
        if not reserva:
            raise HTTPException(status_code=404, detail="No se encontró una reserva asociada al participante")

        # Se verifica que la reserva esté activa
        if reserva["estado"] != "activa":
            raise HTTPException(
                status_code=400,
                detail=f"La reserva no puede cancelarse porque su estado actual es '{reserva['estado']}'"
            )

        # Sólo el creador puede cancelar la reserva
        if reserva.get("creador") != ci:
            raise HTTPException(status_code=403, detail="Solo el creador de la reserva puede cancelarla")

        # Bloqueo de cancelación según fecha y hora
        cur.execute("SELECT NOW() AS now")
        now = cur.fetchone()["now"]
        
        if str(reserva["fecha"]) < str(now.date()):
            raise HTTPException(status_code=400, detail="No se puede cancelar una reserva de días anteriores")

        # Si es hoy, validar que no haya comenzado
        if str(reserva["fecha"]) == str(now.date()) and str(reserva["hora_inicio"]) <= str(now.time()):
            raise HTTPException(status_code=400, detail="La reserva ya empezó, no puede ser cancelada")

        # Cancelo la reserva
        cur.execute("""
            UPDATE reserva
            SET estado = 'cancelada'
            WHERE id_reserva = %s;
        """, (request.id_reserva,))
        cn.commit()

        return {"mensaje": f"Reserva {request.id_reserva} cancelada exitosamente"}

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
