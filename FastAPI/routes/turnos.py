from fastapi import APIRouter
from db.connector import getConnection

router = APIRouter()

@router.get("/turnosPosibles")
def turnosTotales(): 
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        # Traemos los turnos  con un formato adecuado 
        cur.execute("""
            SELECT 
                id_turno, 
                TIME_FORMAT(hora_inicio, '%H:%i:%s') AS hora_inicio, 
                TIME_FORMAT(hora_fin, '%H:%i:%s') AS hora_fin
            FROM turno;
        """)

        resp = cur.fetchall()
        return {"turnos_posibles": resp}

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cur.close()
            cn.close()
        except:
            pass
