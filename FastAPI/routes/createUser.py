from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.passwordHash import hashPassword
from db.registerSentences import insertLogin, insertPaticipante, insertParticipanteProgramaAcademico, verifyExisteUser
from db.connector import getConnection

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

    if not isinstance(ci, int):
        raise HTTPException(status_code=400, detail="ci debe ser un entero")

    ci_str = str(ci)
    if len(ci_str) != 8:
        raise HTTPException(status_code=400, detail="ci debe tener exactamente 8 dígitos")

    if not isinstance(name, str) or name.strip() == "":
        raise HTTPException(status_code=400, detail="name es requerido")

    if not isinstance(lastName, str) or lastName.strip() == "":
        raise HTTPException(status_code=400, detail="lastName es requerido")

    if not isinstance(password, str) or password.strip() == "":
        raise HTTPException(status_code=400, detail="password es requerido")

    if len(password) <= 6:
        raise HTTPException(status_code=400, detail="password debe tener más de 6 caracteres")

    if not isinstance(academicProgram, str) or academicProgram.strip() == "":
        raise HTTPException(status_code=400, detail="academicProgram es requerido")

    try:
        local, domain = correo.split("@", 1)
    except ValueError:
        raise HTTPException(status_code=400, detail="correo inválido")

    if domain.startswith("correo."):
        rol = "alumno"
    elif domain.startswith("ucu."):
        rol = "alumno"
    else:
        raise HTTPException(status_code=400, detail="correo inválido (debe ser @correo.* o @ucu.*)")
    
    verifyExisteUser(ci, correo, "Invitado")

    passwordHashed = hashPassword(password)

    if insertLogin(correo, passwordHashed, "Invitado") == 0:
        raise HTTPException(status_code=400, detail="Error al insertar en login")

    if insertPaticipante(ci, name, lastName, correo, "Invitado") == 0:
        raise HTTPException(status_code=400, detail="Error al insertar en participante")

    if insertParticipanteProgramaAcademico(ci, academicProgram, rol, "Invitado") == 0:
        raise HTTPException(status_code=400, detail="Error al insertar en participante_programa_academico")

    return {"status": "created"}

@router.get("/createUser/programs")
def getPrograms():
    conn = getConnection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT nombre_programa FROM programa_academico")
    programs = cursor.fetchall()

    cursor.close()
    conn.close()

    return {"programs": programs}