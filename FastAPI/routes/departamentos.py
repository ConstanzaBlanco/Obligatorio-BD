from fastapi import APIRouter
from db.connector import getConnection

router = APIRouter()

@router.get("/departamentos")
def obtener_departamentos():
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        cur.execute("""
            SELECT DISTINCT departamento
            FROM edificio
            WHERE departamento IS NOT NULL
            ORDER BY departamento ASC;
        """)

        departamentos = cur.fetchall()

       
        lista = [d["departamento"] for d in departamentos]

        return {
            "departamentos": lista,
            "total": len(lista)
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cur.close()
            cn.close()
        except:
            pass
