from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db.facultadSentences import (
    createFacultad,
    getFacultades,
    getOneFacultad,
    updateFacultad,
    deleteFacultad
)

router = APIRouter(prefix="/facultad", tags=["Facultad"])

class FacultadCreate(BaseModel):
    nombre: str

class FacultadUpdate(BaseModel):
    nombre: str


@router.post("/create")
def create_facultad(payload: FacultadCreate):
    nombre = payload.nombre.strip()

    if nombre == "":
        raise HTTPException(status_code=400, detail="Nombre requerido")

    if createFacultad(nombre) == 0:
        raise HTTPException(status_code=400, detail="Error al crear facultad")

    return {"status": "created", "nombre": nombre}


@router.get("/all")
def get_all():
    return getFacultades()


@router.get("/{id_facultad}")
def get_one(id_facultad: int):
    fac = getOneFacultad(id_facultad)
    if not fac:
        raise HTTPException(status_code=404, detail="Facultad no encontrada")
    return fac


@router.put("/update/{id_facultad}")
def update(id_facultad: int, payload: FacultadUpdate):
    if updateFacultad(id_facultad, payload.nombre.strip()) == 0:
        raise HTTPException(status_code=404, detail="Facultad no encontrada")
    return {"status": "updated"}


@router.delete("/delete/{id_facultad}")
def delete(id_facultad: int):
    if deleteFacultad(id_facultad) == 0:
        raise HTTPException(status_code=404, detail="Facultad no encontrada")
    return {"status": "deleted"}
