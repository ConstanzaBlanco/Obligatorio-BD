from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.security import create_token
from dbConnect import get_user, update_last_access

router = APIRouter(tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(payload: LoginRequest):
    correo = payload.username
    password = payload.password

    user = get_user(correo)
    if not user or user["contrasenia"] != password:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    update_last_access(correo)
    token = create_token(correo)
    return {"access_token": token, "token_type": "bearer"}
