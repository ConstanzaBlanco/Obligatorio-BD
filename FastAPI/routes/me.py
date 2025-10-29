from fastapi import APIRouter, Depends
from core.security import requireRole
from db.loginSentences import getOneUser

router = APIRouter()

@router.get("/me")
def home(userLogin=Depends(requireRole("Usuario"))):
    user = getOneUser(userLogin['correo'])
    return {
        "ci": user["ci"],
        "name": user["nombre"],
        "lastName": user["apellido"],
        "mail": user["email"],
        "last_access": userLogin["last_access"],
        "rol": userLogin["rol"],
    }