from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.security import createToken
from db.loginSentences import getUser, updateLastAccess
from core.passwordHash import verifyPassword

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(payload: LoginRequest):
    correo = payload.username
    password = payload.password

    print("--------- LOGIN DEBUG ---------")
    print("Correo recibido:", repr(payload.username))
    print("Correo procesado:", repr(correo))

    user = getUser(correo)
    roleDb = user["rol"]

    print("Resultado getUser():", user)
    print("--------------------------------")

    # Usuario no encontrado en la bd
    if not user:
        raise HTTPException(status_code=401, detail="No se encontró el usuario")

    # el usario no tiene contraseña 
    if not user.get("contrasenia"):
        raise HTTPException(status_code=500, detail="Error interno: usuario sin contraseña registrada")

    # mall la contra bro
    if not verifyPassword(password, user["contrasenia"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas, la contraseña no coincide")

    # se actualiza la ultima conexion
    updateLastAccess(correo, roleDb)

    # generamos el token pal front
    token = createToken(correo)

    return {
        "access_token": token,
        "token_type": "bearer",
        "rol": user["rol"]
    }