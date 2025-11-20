from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from db.academicProgramSentences import (
    createPrograma,
    getProgramas,
    getOnePrograma,
    updatePrograma,
    deletePrograma
)
from core.security import requireRole
from core.invalidInput import isInvalidInput

router = APIRouter(prefix="/programa", tags=["Programa Académico"])


class ProgramaCreate(BaseModel):
    nombre_programa: str
    id_facultad: int
    tipo: str   # "grado" o "posgrado"


class ProgramaUpdate(BaseModel):
    id_facultad: int
    tipo: str


@router.post("/create")
def create_programa(payload: ProgramaCreate, user = Depends(requireRole("Administrador"))):
    nombre = payload.nombre_programa.strip()
    tipo = payload.tipo.lower()

    if isInvalidInput(nombre) or isInvalidInput(tipo):
        raise HTTPException(status_code=401, detail="Error: credenciales inválidas")

    if tipo not in ("grado", "posgrado"):
        raise HTTPException(status_code=400, detail="Tipo inválido")

    if nombre == "":
        raise HTTPException(status_code=400, detail="Nombre requerido")

    roleDb = user["rol"]

    if createPrograma(nombre, payload.id_facultad, tipo, roleDb) == 0:
        raise HTTPException(status_code=400, detail="Error al crear programa académico")

    return {"status": "created", "nombre_programa": nombre}


@router.get("/all")
def get_all_programas(user = Depends(requireRole("Administrador"))):
    roleDb = user["rol"]
    return getProgramas(roleDb)


@router.get("/{nombre_programa}")
def get_one_programa(nombre_programa: str, user = Depends(requireRole("Administrador"))):
    roleDb = user["rol"]
    programa = getOnePrograma(nombre_programa, roleDb)

    if not programa:
        raise HTTPException(status_code=404, detail="Programa académico no encontrado")

    return programa


@router.put("/update/{nombre_programa}")
def update_programa(nombre_programa: str, payload: ProgramaUpdate, user = Depends(requireRole("Administrador"))):
    tipo = payload.tipo.lower()

    if isInvalidInput(tipo):
        raise HTTPException(status_code=401, detail="Error: credenciales inválidas")

    if tipo not in ("grado", "posgrado"):
        raise HTTPException(status_code=400, detail="Tipo inválido")

    roleDb = user["rol"]

    if updatePrograma(nombre_programa, payload.id_facultad, tipo, roleDb) == 0:
        raise HTTPException(status_code=404, detail="Programa académico no encontrado")

    return {"status": "updated"}


@router.delete("/delete/{nombre_programa}")
def delete_programa(nombre_programa: str, user = Depends(requireRole("Administrador"))):

    if isInvalidInput(nombre_programa):
        raise HTTPException(status_code=401, detail="Error: credenciales inválidas")

    roleDb = user["rol"]

    if deletePrograma(nombre_programa, roleDb) == 0:
        raise HTTPException(status_code=404, detail="Programa académico no encontrado")

    return {"status": "deleted"}
