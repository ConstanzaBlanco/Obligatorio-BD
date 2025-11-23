from fastapi import APIRouter, Depends
from core.security import requireRole
from db.reservationSentences import getAllReservations
from db.connector import getConnection 

router = APIRouter()

@router.get("/sanctionsPast")
def sanctions_past(user=Depends(requireRole("Bibliotecario", "Administrador"))):
    roleDb = user["rol"]
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute("""
            SELECT 
                s.id,
                s.ci_participante,
                p.email,
                s.fecha_inicio,
                s.fecha_fin,
                s.descripcion
            FROM sancion_participante AS s
            JOIN participante p ON p.ci = s.ci_participante
            WHERE s.fecha_fin < CURDATE()
            ORDER BY s.fecha_fin DESC;
        """)
        return {"sanciones_pasadas": cur.fetchall()}
    finally:
        cn.close()
