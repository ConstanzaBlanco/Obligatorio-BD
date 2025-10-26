from fastapi import Depends
from core.security import current_user
from fastapi import APIRouter

router = APIRouter()

@router.get("/home")
def home(user=Depends(current_user)):
    return {
        "message": f"Iniciaste sesión correctamente, {user['correo']}",
        "last_access": user["last_access"],
    }