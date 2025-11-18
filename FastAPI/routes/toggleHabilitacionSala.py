# routes/toggleSala.py
from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import requireRole

router = APIRouter()

@router.patch("/toggleHabilitacionSala")
def toggle_habilitacion(nombre_sala: str, edificio: str, user=Depends(requireRole("Administrador"))):

    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        # Verificar existencia
        cur.execute("""
            SELECT habilitada
            FROM sala
            WHERE nombre_sala = %s AND edificio = %s
        """, (nombre_sala, edificio))

        sala = cur.fetchone()
        if not sala:
            raise HTTPException(status_code=404, detail="La sala no existe")

        # Nuevo estado (true ↔ false)
        nuevo_estado = not sala["habilitada"]

        # 🚫 VALIDACIÓN: solo si se quiere DESHABILITAR
        if not nuevo_estado:
            cur.execute("""
                SELECT COUNT(*) AS activas
                FROM reserva
                WHERE nombre_sala = %s
                  AND edificio = %s
                  AND estado = 'activa'
            """, (nombre_sala, edificio))

            reservas = cur.fetchone()

            if reservas["activas"] > 0:
                raise HTTPException(
                    status_code=400,
                    detail="No se puede deshabilitar la sala porque tiene reservas activas."
                )

        # Actualizar estado
        cur.execute("""
            UPDATE sala
            SET habilitada = %s
            WHERE nombre_sala = %s AND edificio = %s
        """, (nuevo_estado, nombre_sala, edificio))

        cn.commit()

        return {
            "mensaje": "Estado actualizado exitosamente.",
            "habilitada": nuevo_estado
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        cn.close()
