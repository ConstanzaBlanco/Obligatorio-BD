from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import currentUser  # 🔥 Agregar esto

router = APIRouter()

@router.get("/edificios")
def obtener_edificios(departamento: str = None, user = Depends(currentUser)):
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        # Hacemos una query que nos de todos los edificios, con filtro opcional
        query = """
            SELECT 
                nombre_edificio,
                direccion,
                departamento,
                id_facultad
            FROM edificio
            WHERE 1 = 1
        """

        params = []

        if departamento:
            query += " AND departamento = %s"
            params.append(departamento)

        cur.execute(query, tuple(params))
        edificios = cur.fetchall()

        if not edificios:
            return {"mensaje": "No se encontraron edificios con ese filtro"}

        return {
            "edificios": edificios,
            "total": len(edificios)
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cur.close()
            cn.close()
        except:
            pass
