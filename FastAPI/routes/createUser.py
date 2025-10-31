from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.passwordHash import hashPassword
from db.registerSentences import insertLogin, insertPaticipante, insertParticipanteProgramaAcademico

router = APIRouter()

class CreateUserRequest(BaseModel):
    correo: str
    ci: int
    name: str
    lastName: str
    password: str
    academicProgram: str

@router.post("/createUser")
def createUser(payload: CreateUserRequest):
    correo = payload.correo.strip().lower()
    ci = payload.ci
    name = payload.name
    lastName = payload.lastName
    password = payload.password
    academicProgram = payload.academicProgram
    rol = ""

    # Validaciones
    if not isinstance(correo, str) or correo.strip() == "":
        raise HTTPException(status_code=400, detail="correo es requerido")
    if not isinstance(ci, int) or ci <= 0:
        raise HTTPException(status_code=400, detail="ci debe ser un entero positivo")
    if not isinstance(name, str) or name.strip() == "":
        raise HTTPException(status_code=400, detail="name es requerido")
    if not isinstance(lastName, str) or lastName.strip() == "":
        raise HTTPException(status_code=400, detail="lastName es requerido")
    if not isinstance(password, str) or password.strip() == "":
        raise HTTPException(status_code=400, detail="password es requerido")
    if not isinstance(academicProgram, str) or academicProgram.strip() == "":
        raise HTTPException(status_code=400, detail="academicProgram es requerido")

    # Dominio -> rol
    try:
        local, domain = correo.split("@", 1)
    except ValueError:
        raise HTTPException(status_code=400, detail="correo inválido")

    if domain.startswith("correo."):
        rol = "alumno"
    elif domain.startswith("ucu."):
        rol = "docente"
    else:
        raise HTTPException(status_code=400, detail="correo inválido (debe ser @correo.* o @ucu.*)")

    # Hash de password
    passwordHashed = hashPassword(password)

    # Inserts (si rowcount == 0 => error)
    if insertLogin(correo, passwordHashed) == 0:
        raise HTTPException(status_code=400, detail="Error al insertar en login")

    if insertPaticipante(ci, name, lastName, correo) == 0:
        raise HTTPException(status_code=400, detail="Error al insertar en participante")

    if insertParticipanteProgramaAcademico(ci, academicProgram, rol) == 0:
        raise HTTPException(status_code=400, detail="Error al insertar en participante_programa_academico")

    return {"status": "created"}
