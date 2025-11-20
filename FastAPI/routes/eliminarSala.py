from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import requireRole

router = APIRouter()

@router.delete("/eliminarSala/{nombre_sala}/{edificio}")
def eliminarSala(nombre_sala: str, edificio: str, user=Depends(requireRole("Administrador"))):

    cn = getConnection("Administrador")

    try:
        cur = cn.cursor(dictionary=True)

        # Verificar si existen reservas asociadas
        cur.execute("""
            SELECT COUNT(*) AS cant
            FROM reserva
            WHERE nombre_sala = %s AND edificio = %s
        """, (nombre_sala, edificio))

        row = cur.fetchone()
        if row["cant"] > 0:
            raise HTTPException(
                status_code=400,
                detail="No se puede eliminar la sala porque tiene reservas asociadas."
            )

        # Eliminar la sala
        cur.execute("""
            DELETE FROM sala
            WHERE nombre_sala = %s AND edificio = %s
        """, (nombre_sala, edificio))

        if cur.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="La sala no existe o ya fue eliminada."
            )

        cn.commit()
        return {"mensaje": "Sala eliminada correctamente."}

    finally:
        cn.close()
