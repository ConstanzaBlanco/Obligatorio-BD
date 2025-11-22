from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.security import requireRole
from db.reservationSentences import (
    updateAssistUser,
    getAllCisOfOneReservation,
    updateReserveToFinish
)
from db.sanctionsSentences import createSanction
from datetime import date, timedelta
from db.notificationSentences import createNotification
from db.connector import getConnection

router = APIRouter()

class UpdateStateOfReservation(BaseModel):
    reserveId: int
    cis: list[int]

def es_bibliotecario(ci: int) -> bool:
    cn = getConnection()
    cur = cn.cursor(dictionary=True)

    cur.execute("""
        SELECT l.rol 
        FROM participante p
        JOIN login l ON p.email = l.correo
        WHERE p.ci = %s
    """, (ci,))

    row = cur.fetchone()

    cur.close()
    cn.close()

    return bool(row and row["rol"] == "Bibliotecario")



@router.post("/updateReservation")
def update_reservation_state(
    payload: UpdateStateOfReservation,
    user=Depends(requireRole("Bibliotecario"))
):
    roleDb = user["rol"]

    reserveId = payload.reserveId
    attended_cis = payload.cis

    # Obtener los CIS directamente (ahora devuelve ints)
    rows = getAllCisOfOneReservation(reserveId, roleDb)
    if not rows:
        raise HTTPException(404, "No existe la reserva o no tiene participantes asignados")

    existing_cis = rows  # 👈 YA NO ES UNA LISTA DE DICCIONARIOS

    # Filtrar NO bibliotecarios
    sancionables = [ci for ci in existing_cis if not es_bibliotecario(ci)]
    attended_cis = [ci for ci in attended_cis if ci in sancionables]

    # Si no hay nadie sancionable
    if len(sancionables) == 0:
        updateReserveToFinish(reserveId, "finalizada", roleDb)
        return {
            "success": True,
            "message": "Reserva finalizada. Todos eran bibliotecarios, nadie sancionado."
        }

    # Si nadie asistió
    if len(attended_cis) == 0:
        return handle_non_assistance(reserveId, sancionables, roleDb)

    # Registrar asistencia
    for ci in attended_cis:
        updateAssistUser(ci, reserveId, True, roleDb)

    updateReserveToFinish(reserveId, "finalizada", roleDb)

    return {
        "success": True,
        "message": "Asistencias registradas correctamente",
        "asistieron": attended_cis
    }


def handle_non_assistance(reserveId: int, cis_sancionables: list[int], roleDb):
    fechaInicio = date.today()
    fechaFin = fechaInicio + timedelta(days=60)

    inicio = fechaInicio.strftime("%d/%m/%Y")
    fin = fechaFin.strftime("%d/%m/%Y")
    motivo = "No asistir a la sala reservada."

    for ci in cis_sancionables:
        updateAssistUser(ci, reserveId, False, roleDb)
        createSanction(ci, roleDb)
        createNotification(
            ci,
            "SANCION",
            f"Has sido sancionado del {inicio} al {fin}. Motivo: {motivo}",
            referencia_tipo="sancion",
            referencia_id=None
        )

    updateReserveToFinish(reserveId, "sin asistencia", roleDb)

    return {
        "success": True,
        "message": "Nadie asistió. Solo se sancionó a los NO bibliotecarios.",
        "cis_sancionados": cis_sancionables
    }
