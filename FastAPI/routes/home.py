from fastapi import APIRouter, Depends
from core.security import requireRole

router = APIRouter()

@router.get("/home")
def home(user=Depends(requireRole("Usuario"))):
    return {
        "message": f"Iniciaste sesión correctamente, {user['correo']}",
        "last_access": user["last_access"],
        "rol": user["rol"],
    }