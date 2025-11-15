from fastapi import APIRouter
from db.connector import getConnection

router = APIRouter()

#Este me parece irrelevante después diganme si no
@router.get("/showAll")
def showAll():
    try:
        cn = getConnection()
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

    