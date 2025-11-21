from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.security import requireRole
from db.connector import getConnection

router = APIRouter()

class NuevaSancion(BaseModel):
    ci: int
    fecha_inicio: str
    fecha_fin: str
    descripcion: str 

@router.post("/agregarSancion")
def agregar_sancion(payload: NuevaSancion, user=Depends(requireRole("Bibliotecario"))):

    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor()

    try:
        # validar participante
        cur.execute("SELECT 1 FROM participante WHERE ci = %s", (payload.ci,))
        if not cur.fetchone():
            raise HTTPException(404, "El CI no existe")

        # insertar sanción
        cur.execute("""
            INSERT INTO sancion_participante 
            (ci_participante, fecha_inicio, fecha_fin, descripcion)
            VALUES (%s, %s, %s, %s)
        """, (
            payload.ci,
            payload.fecha_inicio,
            payload.fecha_fin,
            payload.descripcion
        ))

        cn.commit()
        return {"mensaje": "Sanción creada correctamente"}

    except Exception as e:
        raise HTTPException(500, str(e))

    finally:
        cur.close()
        cn.close()
