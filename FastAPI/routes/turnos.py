from fastapi import APIRouter, Depends
from db.connector import getConnection

router = APIRouter()

@router.get("/turnosPosibles")
def turnosTotales(): 
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        cur.execute("""
           SELECT 
  id_turno, 
  TIME_FORMAT(hora_inicio, '%H:%i:%s') AS hora_inicio, 
  TIME_FORMAT(hora_fin, '%H:%i:%s') AS hora_fin,
  created_at, deleted_at
FROM turno;
        """)

        resp = cur.fetchall()
        return {"Turnos posibles": resp}

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass
