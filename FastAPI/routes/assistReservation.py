from fastapi import APIRouter, Depends
from pydantic import BaseModel
from core.security import requireRole
from db.reservationSentences import updateAssistUser, getAllCisOfOneReservation, updateReserveToFinish
from db.sanctionsSentences import createSanction

router = APIRouter()


class updateStateOfReservation(BaseModel):
    reserveId: int
    cis: list[int] #CIs que asistieron

@router.post("/updateReservation")
def updateStateOfReservation(payload: updateStateOfReservation):
    cis = payload.cis
    reserveId = payload.reserveId

    if len(cis) == 0:
        return nonAssist(reserveId)
    
    for ci in cis:
        updateAssistUser(ci, reserveId, True)

    updateReserveToFinish(reserveId, 'finalizada')
    return {"status": "201"}

def nonAssist(reserveId: int):
    cis = getAllCisOfOneReservation(reserveId)
    for ci in cis:
        updateAssistUser(ci, reserveId, False)
        createSanction(ci)

    updateReserveToFinish(reserveId, 'sin asistencia')
    return {"status": "Sansionados!"}