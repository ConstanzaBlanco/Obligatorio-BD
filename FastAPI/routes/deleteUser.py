from fastapi import APIRouter, HTTPException, Depends
from db.loginSentences import deleteUser
from core.security import requireRole

router = APIRouter()


@router.delete("/deleteUser/{correo}")
def deleteUserEndpoint(correo: str, user = Depends(requireRole("Administrador", "Bibliotecario"))):
    correo = correo.strip().lower()
    roleDb = user["rol"]

    # Validar correo
    if correo.count("@") != 1:
        raise HTTPException(status_code=400, detail="correo inválido")

    local, domain = correo.split("@")
    if not local or not domain:
        raise HTTPException(status_code=400, detail="correo inválido")

    # Ejecutar delete físico o lógico según tu función
    result = deleteUser(correo, roleDb)

    if result == 0:
        raise HTTPException(status_code=404, detail="usuario no encontrado o ya eliminado")

    return {"status": "deleted", "correo": correo}
