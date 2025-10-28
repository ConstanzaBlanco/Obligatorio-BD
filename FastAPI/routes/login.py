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

    user = getUser(correo)
    if not user or not verifyPassword(password, user["contrasenia"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    updateLastAccess(correo)
    token = createToken(correo)
    return {"access_token": token, "token_type": "bearer"}
