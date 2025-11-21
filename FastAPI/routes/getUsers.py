from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import requireRole
from pydantic import BaseModel

router = APIRouter()

@router.get("/users")
def getUsersByRole(user=Depends(requireRole("Administrador", "Bibliotecario"))):

    rol_user = user["rol"]

    if rol_user == "Administrador":
        query = """
            SELECT correo, rol, last_access
            FROM login
            WHERE rol IN ('Usuario', 'Bibliotecario')
        """
        params = ()

    elif rol_user == "Bibliotecario":
        query = """
            SELECT 
                l.correo,
                ppa.rol,
                l.last_access
            FROM login l
            JOIN participante p 
                ON l.correo = p.email
            JOIN participante_programa_academico ppa
                ON p.ci = ppa.ci_participante
            WHERE l.rol = 'Usuario'
        """
        params = ()

    else:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para ver usuarios."
        )

    conn = getConnection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(query, params)
    users = cursor.fetchall()

    cursor.close()
    conn.close()

    return {
        "cantidad": len(users),
        "usuarios": users
    }

class ChangeRoleRequest(BaseModel):
    correo: str
    rol: str
    
@router.patch("/users/updateRol")
def update_user_role(payload: ChangeRoleRequest, user=Depends(requireRole("Bibliotecario"))):
    nuevo_rol = payload.rol
    correo = payload.correo 

    conn = getConnection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        UPDATE participante_programa_academico ppa
        JOIN participante p ON ppa.ci_participante = p.ci
        SET ppa.rol = %s
        WHERE p.email = %s
    """, (nuevo_rol, correo))

    conn.commit()
    filas_afectadas = cursor.rowcount

    cursor.close()
    conn.close()

    if filas_afectadas == 0:
        raise HTTPException(
            status_code=404,
            detail="No se encontró un participante con ese correo."
        )

    return {
        "mensaje": "Rol actualizado correctamente",
    }
