from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import currentUser 
from datetime import date

router = APIRouter()

@router.get("/seeOwnActiveSanctions")
def seeOwnActiveSanctions(user=Depends(currentUser)):
    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        correo = user["correo"]

        cur.execute("SELECT ci FROM participante WHERE email = %s", (correo,))
        participante = cur.fetchone()

        if not participante:
            raise HTTPException(status_code=404, detail="No existe el participante")

        ci = participante["ci"]

        hoy = date.today()

        cur.execute("""
            SELECT id, fecha_inicio, fecha_fin, descripcion
            FROM sancion_participante
            WHERE ci_participante = %s
              AND fecha_fin >= %s
            ORDER BY fecha_inicio DESC
        """, (ci, hoy))

        sanciones = cur.fetchall()
        return {"sanciones": sanciones}

    finally:
        try:
            cur.close()
            cn.close()
        except:
            pass