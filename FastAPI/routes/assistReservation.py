from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.security import requireRole
from db.reservationSentences import updateAssistUser, getAllCisOfOneReservation, updateReserveToFinish
from db.sanctionsSentences import createSanction

router = APIRouter()

class UpdateStateOfReservation(BaseModel):
    reserveId: int
    cis: list[int]

@router.post("/updateReservation")
def update_reservation_state(
    payload: UpdateStateOfReservation,
    user=Depends(requireRole("Bibliotecario"))  # ← CORRECTO
):
    reserveId = payload.reserveId
    attended_cis = payload.cis

    existing_cis = getAllCisOfOneReservation(reserveId)

    if not existing_cis:
        raise HTTPException(status_code=404, detail="No existe la reserva o no tiene participantes asignados")

    if len(attended_cis) == 0:
        return handle_non_assistance(reserveId, existing_cis)

    for ci in attended_cis:
        if ci not in existing_cis:
            raise HTTPException(status_code=400, detail=f"El CI {ci} no pertenece a esta reserva")

    for ci in attended_cis:
        updateAssistUser(ci, reserveId, True)

    updateReserveToFinish(reserveId, 'finalizada')

    return {
        "success": True,
        "message": "Asistencias registradas correctamente",
        "cis_de_la_reserva": existing_cis,
        "cis_que_asistieron": attended_cis
    }

def handle_non_assistance(reserveId: int, existing_cis: list[int]):
    for ci in existing_cis:
        updateAssistUser(ci, reserveId, False)
        createSanction(ci)

    updateReserveToFinish(reserveId, 'sin asistencia')

    return {
        "success": True,
        "message": "Nadie asistió, todos sancionados",
        "cis_sancionados": existing_cis
    }
