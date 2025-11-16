from fastapi import APIRouter, Depends
from core.security import requireRole
from core.security import currentUser

router = APIRouter()

@router.get("/home")
def home(user=Depends(currentUser)):
    return {
        "message": f"Iniciaste sesión correctamente, {user['correo']}",
        "last_access": user["last_access"],
        "rol": user["rol"],
    }