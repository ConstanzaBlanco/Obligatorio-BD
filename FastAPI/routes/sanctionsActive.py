from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import requireRole
from datetime import date

router = APIRouter()

@router.get("/sanctionsActive")
def sanctions_active(user=Depends(requireRole("Bibliotecario", "Administrador"))):

    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        cur.execute("""
            SELECT 
                sp.ci_participante,
                sp.fecha_inicio,
                sp.fecha_fin,
                p.email
            FROM sancion_participante sp
            JOIN participante p ON p.ci = sp.ci_participante
            WHERE sp.fecha_fin IS NULL 
               OR sp.fecha_fin >= CURDATE()
            ORDER BY sp.fecha_inicio DESC
        """)

        sanciones = cur.fetchall()

        return {"sanciones_activas": sanciones}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        cn.close()
