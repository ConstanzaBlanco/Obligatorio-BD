
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from db.connector import getConnection
from core.security import requireRole

router = APIRouter()

class EditarEdificioRequest(BaseModel):
    nombre_original: str
    id_facultad: int

@router.put("/editarEdificio")
def editar_edificio(data: EditarEdificioRequest, user=Depends(requireRole("Administrador"))):
    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        # Verificar que el edificio existe
        cur.execute("SELECT * FROM edificio WHERE nombre_edificio=%s", (data.nombre_original,))
        edif = cur.fetchone()
        if not edif:
            raise HTTPException(status_code=404, detail="El edificio no existe.")

        # Verificar que la facultad existe
        cur.execute("SELECT * FROM facultad WHERE id_facultad=%s", (data.id_facultad,))
        fac = cur.fetchone()
        if not fac:
            raise HTTPException(status_code=404, detail="La facultad no existe.")

        # Actualizar solo la facultad
        cur.execute("""
            UPDATE edificio 
            SET id_facultad=%s
            WHERE nombre_edificio=%s
        """, (data.id_facultad, data.nombre_original))

        cn.commit()
        return {"mensaje": "Facultad del edificio actualizada correctamente."}

    except Exception as e:
        raise HTTPException(status_code=500, detail="Error al actualizar edificio.")

    finally:
        try:
            cur.close()
            cn.close()
        except:
            pass
