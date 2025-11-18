from fastapi import APIRouter, Depends, HTTPException, Query
from db.connector import getConnection
from core.security import requireRole

router = APIRouter()

@router.post("/quitarSancion")
def quitar_sancion(
    ci: int = Query(...),
    user=Depends(requireRole("Bibliotecario", "Administrador"))
):

    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        print("DEBUG CI recibido:", ci)

        # Buscar sanción activa
        cur.execute("""
            SELECT *
            FROM sancion_participante
            WHERE ci_participante = %s
              AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())
            LIMIT 1
        """, (ci,))
        
        sancion = cur.fetchone()
        print("DEBUG sancion encontrada:", sancion)

        if not sancion:
            raise HTTPException(
                status_code=404,
                detail="No hay sanción activa para este participante"
            )

        # Marcar como finalizada AYER para que no aparezca más como activa
        cur.execute("""
            UPDATE sancion_participante
            SET fecha_fin = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            WHERE ci_participante = %s
              AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())
        """, (ci,))

        cn.commit()

        return {"mensaje": "Sanción quitada correctamente"}

    except Exception as e:
        print("ERROR REAL:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

    finally:
        cur.close()
        cn.close()
