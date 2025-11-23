from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import requireRole
from db.notificationSentences import createNotification

router = APIRouter(prefix="/sancion", tags=["Sanciones"])

@router.delete("/{id_sancion}")
def quitar_sancion(
    id_sancion: int,
    user=Depends(requireRole("Bibliotecario", "Administrador"))
):
    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        print("DEBUG id_sancion recibido:", id_sancion)

        # Buscar sanción "activa" por ID
        cur.execute("""
            SELECT *
            FROM sancion_participante
            WHERE id = %s
              AND fecha_fin >= CURDATE()
            LIMIT 1
        """, (id_sancion,))
        
        sancion = cur.fetchone()
        print("DEBUG sancion encontrada:", sancion)

        if not sancion:
            raise HTTPException(
                status_code=404,
                detail="No hay sanción activa con ese ID"
            )

        # Marcar como finalizada AYER
        cur.execute("""
            UPDATE sancion_participante
            SET fecha_fin = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            WHERE id = %s
              AND fecha_fin >= CURDATE()
        """, (id_sancion,))

        cn.commit()

        # ENVIAR NOTIFICACIÓN AL PARTICIPANTE
        createNotification(
            sancion["ci_participante"],
            "SANCION ELIMINADA",
            "Tu sanción activa ha sido levantada.",
            referencia_tipo="sancion",
            referencia_id=sancion["id"],   # 👈 acá también era id_sancion antes
        )

        return {"mensaje": "Sanción quitada correctamente"}

    except HTTPException:
        raise

    except Exception as e:
        print("ERROR REAL:", str(e))
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

    finally:
        cur.close()
        cn.close()
