from fastapi import APIRouter, HTTPException
from db.connector import getConnection

router = APIRouter()

VALID_ROLES = ["Usuario", "Bibliotecario"]

@router.get("/users/{rol}")
def getUsersByRole(rol: str):
    # Normalizamos el rol
    rol = rol.capitalize()

    if rol not in VALID_ROLES:
        raise HTTPException(
            status_code=400, 
            detail=f"Rol inválido. Roles válidos: {VALID_ROLES}"
        )

    conn = getConnection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT correo, rol, last_access FROM login WHERE rol = %s",
        (rol,)
    )
    
    users = cursor.fetchall()

    cursor.close()
    conn.close()

    return {
        "rol": rol,
        "cantidad": len(users),
        "usuarios": users
    }
