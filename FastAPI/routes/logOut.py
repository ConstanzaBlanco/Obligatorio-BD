from fastapi import APIRouter, Depends, HTTPException
from core.security import currentUser
from db.loginSentences import clearTokenJti

router = APIRouter()

@router.post("/logout")
def logout(user = Depends(currentUser)):
    correo = user.get("correo")

    if not correo:
        raise HTTPException(status_code=400, detail="No se pudo determinar el usuario")

    affected = clearTokenJti(correo)

    if affected == 0:
        raise HTTPException(status_code=400, detail="No se pudo cerrar sesión")

    return {"status": "logged_out"}
