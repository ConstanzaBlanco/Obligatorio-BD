from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser 

router = APIRouter()
@router.get("/seeOwnActiveSanctions")
def seeOwnActiveSanctions(user=Depends(currentUser)):
    try:
        roleDb = user["rol"]
        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        correo = user["correo"]

        cur.execute("SELECT ci FROM participante WHERE email = %s", (correo,))
        participante = cur.fetchone()

        if not participante:
            raise HTTPException(status_code=404, detail="No existe el participante")

        ci = participante["ci"]

        cur.execute("SELECT NOW() AS ahora")
        ahora = cur.fetchone()["ahora"]

        # sanciones activas: ahora BETWEEN inicio y fin
        cur.execute("""
            SELECT fecha_inicio, fecha_fin, descripcion
            FROM sancion_participante
            WHERE ci_participante = %s
              AND %s BETWEEN fecha_inicio AND fecha_fin
            ORDER BY fecha_inicio DESC
        """, (ci, ahora))

        sanciones = cur.fetchall()

        return {"sanciones": sanciones}

    finally:
        try:
            cn.close()
        except:
            pass
