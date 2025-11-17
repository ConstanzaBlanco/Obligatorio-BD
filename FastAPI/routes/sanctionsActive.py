from fastapi import APIRouter, Depends
from core.security import requireRole
from db.connector import getConnection  

router = APIRouter()

@router.get("/sanctionsActive")
def sanctions_active(user=Depends(requireRole("Bibliotecario", "Administrador"))):
    cn = getConnection()
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute("""
            SELECT s.ci_participante, p.email, s.fecha_inicio, s.fecha_fin 
            FROM sancion_participante AS s
            JOIN participante p ON p.ci = s.ci_participante
            WHERE s.fecha_fin >= CURDATE()
            ORDER BY s.fecha_fin ASC;
        """)
        return {"sanciones_activas": cur.fetchall()}
    finally:
        cn.close()
