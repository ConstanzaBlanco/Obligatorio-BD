from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import requireRole

router = APIRouter()

@router.delete("/eliminarEdificio/{nombre_edificio}")
def eliminar_edificio(nombre_edificio: str, user=Depends(requireRole("Administrador"))):

    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        # 1. Verificar si el edificio existe
        cur.execute("""
            SELECT * FROM edificio WHERE nombre_edificio = %s
        """, (nombre_edificio,))
        edificio = cur.fetchone()

        if not edificio:
            raise HTTPException(status_code=404, detail="El edificio no existe.")

        # 2. Verificar si el edificio tiene salas asociadas
        cur.execute("""
            SELECT COUNT(*) AS cantidad
            FROM sala
            WHERE edificio = %s
        """, (nombre_edificio,))
        
        cantidad_salas = cur.fetchone()["cantidad"]

        if cantidad_salas > 0:
            raise HTTPException(
                status_code=400,
                detail=f"No se puede eliminar el edificio porque tiene {cantidad_salas} sala(s) asociada(s)."
            )

        # 3. Eliminar edificio
        cur.execute("""
            DELETE FROM edificio WHERE nombre_edificio = %s
        """, (nombre_edificio,))

        cn.commit()

        return {"mensaje": "Edificio eliminado correctamente."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        cn.close()
