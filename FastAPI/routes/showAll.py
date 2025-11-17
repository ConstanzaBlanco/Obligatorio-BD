from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser

router = APIRouter()

#Este me parece irrelevante después diganme si no
@router.get("/showAll")
def showAll(user=Depends(currentUser)):
    try:
        roleDb = user["rol"]
        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)
        cur.execute("SELECT * FROM reserva")
        resp = cur.fetchall()
        return {"reservas": resp}
    except Exception as e:
        return {"error": str(e)}
    finally:
        try:
            cn.close()
        except:
            pass

    