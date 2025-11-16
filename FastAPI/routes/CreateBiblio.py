from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from core.passwordHash import hashPassword
from db.registerSentences import insertLogin, insertPaticipante, insertBiblioLogin
from core.security import requireRole

router = APIRouter()

class CreateBiblioRequest(BaseModel):
    correo: str
    ci: int
    name: str
    lastName: str
    password: str


@router.post("/createBiblioUser")
def createUser(payload: CreateBiblioRequest, user = Depends(requireRole("Administrador"))):
    correo = payload.correo.strip().lower()
    ci = payload.ci
    name = payload.name
    lastName = payload.lastName
    password = payload.password

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

    if correo.count("@") != 1:
        raise HTTPException(status_code=400, detail="correo inválido")

    local, domain = correo.split("@")
    if local.strip() == "" or domain.strip() == "":
        raise HTTPException(status_code=400, detail="correo inválido")


    passwordHashed = hashPassword(password)


    if insertBiblioLogin(correo, passwordHashed) == 0:
        raise HTTPException(status_code=400, detail="Error al insertar en login")

    if insertPaticipante(ci, name, lastName, correo) == 0:
        raise HTTPException(status_code=400, detail="Error al insertar en participante")

    return {"status": "created"}
