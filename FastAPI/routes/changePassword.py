from fastapi import APIRouter, Depends, HTTPException
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
    
    # La contraseña nueva no puede ser igual a la actual
    if payload.newPassword == payload.currentPassword:
        raise HTTPException(status_code=400, detail="La nueva contraseña no puede ser igual a la actual")

    # Verificar contraseña actual
    if not verifyPassword(payload.currentPassword, userLogin["contrasenia"]):
        raise HTTPException(status_code=400, detail="Contraseña incorrecta")

    # Hashsheo de la nueva contraseña
    hashedPassword = hashPassword(payload.newPassword)

    # Actualizar en la bd
    rows = updatePassword(userLogin['correo'], hashedPassword)

    if rows == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {"status": "OK", "message": "Contraseña actualizada exitosamente"}
