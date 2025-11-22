from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser

router = APIRouter()


@router.get("/participante/existe/{ci}")
def participanteExiste(ci: int, user=Depends(currentUser)):
    try:
        roleDb = user["rol"]
        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        cur.execute("SELECT ci, nombre, apellido, email FROM participante WHERE ci = %s", (ci,))
        p = cur.fetchone()
        cn.close()

        if not p:
            return {"exists": False}

        return {"exists": True, "participante": p}

    except Exception as e:
        return {"error": str(e)}
