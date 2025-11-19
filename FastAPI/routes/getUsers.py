from fastapi import APIRouter, HTTPException, Depends
from db.connector import getConnection
from core.security import requireRole

router = APIRouter()

@router.get("/users")
def getUsersByRole(user=Depends(requireRole("Administrador", "Bibliotecario"))):

    if user["rol"] == "Administrador":
        allowed_roles = ["Usuario", "Bibliotecario"]
    elif user["rol"] == "Bibliotecario":
        allowed_roles = ["Usuario"]
    else:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para ver usuarios."
        )

    conn = getConnection()
    cursor = conn.cursor(dictionary=True)

    query = f"""
        SELECT correo, rol, last_access
        FROM login
        WHERE rol IN ({','.join(['%s'] * len(allowed_roles))})
    """

    cursor.execute(query, tuple(allowed_roles))
    users = cursor.fetchall()

    cursor.close()
    conn.close()

    return {
        "credencial": user["rol"],
        "mostrar_roles": allowed_roles,
        "cantidad": len(users),
        "usuarios": users
    }
