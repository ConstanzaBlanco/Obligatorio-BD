from fastapi import APIRouter, HTTPException
from db.loginSentences import deleteUser

router = APIRouter()


@router.delete("/deleteUser/{correo}")
def deleteUserEndpoint(correo: str):
    correo = correo.strip().lower()

    # Validar correo
    if correo.count("@") != 1:
        raise HTTPException(status_code=400, detail="correo inválido")

    local, domain = correo.split("@")
    if not local or not domain:
        raise HTTPException(status_code=400, detail="correo inválido")

    # Ejecutar delete físico o lógico según tu función
    result = deleteUser(correo)

    if result == 0:
        raise HTTPException(status_code=404, detail="usuario no encontrado o ya eliminado")

    return {"status": "deleted", "correo": correo}
