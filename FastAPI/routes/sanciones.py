from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from core.security import requireRole
from db.sanctionsSentences import createOtherSanction
from datetime import date

router = APIRouter(prefix="/sancion", tags=["Facultad"])

class SancionCreate(BaseModel):
    ci: int
    fechaInicio: date
    fechaFin: date
    descripcion: str



@router.post("/crear")
def create_facultad(payload: SancionCreate, user = Depends(requireRole("Bibliotecario"))):
    roleDb = user["rol"]
    ci = payload.ci
    descripcion = payload.descripcion

    fechaInicio_str = payload.fechaInicio.isoformat()
    fechaFin_str = payload.fechaFin.isoformat()

    # Validación lógica
    if payload.fechaFin < payload.fechaInicio:
        raise HTTPException(status_code=400, detail="fechaFin no puede ser anterior a fechaInicio")

    if createOtherSanction(ci, fechaInicio_str, fechaFin_str, descripcion, roleDb) == 0:
        raise HTTPException(status_code=400, detail="Error al crear sanción")
    
    return {"status": "created"}