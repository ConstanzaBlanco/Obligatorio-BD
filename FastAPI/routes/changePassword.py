from fastapi import APIRouter, Depends
from pydantic import BaseModel
from core.security import requireRole
from db.loginSentences import updatePassword
from core.passwordHash import hashPassword, verifyPassword

router = APIRouter()

class changePassword(BaseModel):
    currentPassword: str
    newPassword: str

@router.patch("/changePassword")
def changePasswd(payload: changePassword, userLogin = Depends(requireRole("Usuario"))):
    
    if payload.newPassword == payload.currentPassword:
        raise HTTPException(status_code=400, detail="La nueva contraseña no puede ser igual a la actual")

    if not verifyPassword(payload.currentPassword, userLogin["contrasenia"]):
        raise HTTPException(status_code=400, detail="Contraseña Incorrecta")

    hashedPassword = hashPassword(payload.newPassword)

    rows = updatePassword(userLogin['correo'], hashedPassword)
    if rows == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {"status": "Password Changed"}