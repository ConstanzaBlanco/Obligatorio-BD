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


from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.security import requireRole
from db.reservationSentences import updateAssistUser, getAllCisOfOneReservation, updateReserveToFinish
from db.sanctionsSentences import createSanction

router = APIRouter()

class UpdateStateOfReservation(BaseModel):
    reserveId: int
    cis: list[int]  # CIs de los que fueron

@router.post("/updateReservation")
def update_reservation_state(payload: UpdateStateOfReservation, user=Depends(requireRole("Bibliotecario"))):
    
    reserveId = payload.reserveId           # ID de la reserva
    attended_cis = payload.cis             # CIs que fueron

    # Sacar cis de los participantes de esa reserva
    existing_cis = getAllCisOfOneReservation(reserveId)

    # Si la reserva no existe o no tiene participantes
    if not existing_cis or len(existing_cis) == 0:
        raise HTTPException(status_code=404, detail="No existe la reserva o no tiene participantes asignados")

    # Si NADIE asistió es les cae una sanción a todos
    if len(attended_cis) == 0:
        return handle_non_assistance(reserveId, existing_cis)

    # revisar que los Cis que se pasen esten en la reserva
    for ci in attended_cis:
        if ci not in existing_cis:
            raise HTTPException(status_code=400, detail=f"El CI {ci} no pertenece a esta reserva")

    # Marcamos asistencia solo a los que vinieron
    for ci in attended_cis:
        updateAssistUser(ci, reserveId, True)

    # Marcar reserva como finalizada
    updateReserveToFinish(reserveId, 'finalizada')

    return {
        "success": True,
        "message": "Asistencias registradas correctamente",
        "cis_de_la_reserva": existing_cis,            # deuvulvo los cis de la reserva
        "cis_que_asistieron": attended_cis            # devuelvo los cis que asistieron
    }

# Si nadie asistió les cae sanción a todos
def handle_non_assistance(reserveId: int, existing_cis: list[int]):
    
    # Recorrer todos los participantes y marcar que no fueron los salames y crear la sación
    for ci in existing_cis:
        updateAssistUser(ci, reserveId, False)
        createSanction(ci)

    # Marcar reserva como sin asist 
    updateReserveToFinish(reserveId, 'sin asistencia')

    return {
        "success": True,
        "message": "Nadie asistió, todos los participantes fueron sancionados",
        "cis_sancionados": existing_cis               # ya lo dice el coso..
    }
