from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import requireRole 

router = APIRouter()

@router.get("/edificios")
def obtener_edificios(departamento: str = None, user = Depends(requireRole("Administrador", "Usuario","Bibliotecario"))):
    try:
        roleDb = user["rol"]
        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        query = """
            SELECT 
                nombre_edificio,
                direccion,
                departamento,
                id_facultad,
                habilitado
            FROM edificio
            WHERE 1 = 1
        """

        params = []

        # Filtro por departamento
        if departamento:
            query += " AND departamento = %s"
            params.append(departamento)

        # Los usuarios ven solo los habilitados
        if roleDb.lower() == "usuario":
            query += " AND habilitado = TRUE"

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
