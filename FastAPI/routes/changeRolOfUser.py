from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from db.loginSentences import updateRolOfUser
from core.security import requireRole
from core.invalidInput import isInvalidInput

router = APIRouter()

class UpdateRolRequest(BaseModel):
    correo: str
    rol: str    # Usuario, Bibliotecario o Administrador


@router.put("/updateUserRole")
def updateUserRole(payload: UpdateRolRequest, user = Depends(requireRole("Administrador"))):
    correo = payload.correo.strip().lower()
    rol = payload.rol.strip()

    if isInvalidInput(correo) or isInvalidInput(rol):
        raise HTTPException(status_code=401, detail="Error: credenciales inválidas")

    roleDb = user["rol"]

    # Validación de correo
    if correo.count("@") != 1:
        raise HTTPException(status_code=400, detail="correo inválido")

    local, domain = correo.split("@")
    if not local or not domain:
        raise HTTPException(status_code=400, detail="correo inválido")

    # Validar rol (según ENUM de la base)
    roles_validos = ["Usuario", "Bibliotecario", "Administrador"]
    if rol not in roles_validos:
        raise HTTPException(status_code=400, detail="rol inválido")

    result = updateRolOfUser(correo, rol, roleDb)
    if result == 0:
        raise HTTPException(status_code=404, detail="usuario no encontrado")

    return {"status": "role_updated", "correo": correo, "nuevo_rol": rol}
