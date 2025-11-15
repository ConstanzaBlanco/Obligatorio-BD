from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser

router = APIRouter()
"""
Este por ahora lo dejo pero en mi opnion ya se va.... porque el front va a ser difrente y edificio y salasdeledifico hacen su funcion



Tomar en cuenta que este endpoint permite filtrar por edificio, fecha y turno. 
Si no se provee alguno de estos filtros, se listan las salas disponibles sin considerar ese filtro.
Por ejemplo, si solo se provee el edificio, se listan todas las salas en ese edificio sin importar su disponibilidad en fecha o turno ya se en algun hoarrio o fecha hay se va a mostrar.
"""
@router.get("/salasDisponibles")
def salas_disponibles(
    edificio: str = None,
    fecha: str = None,
    id_turno: int = None,
    #user: dict = Depends(currentUser) 

):
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)
        """if not user:
            return {"error": "Usuario no autenticado"}"""

        query = """
            SELECT s.nombre_sala, s.edificio, s.capacidad, s.tipo_sala
            FROM sala s
            WHERE 1=1
        """
        params = []

        if edificio:
            query += " AND s.edificio = %s"
            params.append(edificio)

        if fecha and id_turno:
            query += """
                AND s.nombre_sala NOT IN (
                    SELECT r.nombre_sala
                    FROM reserva r
                    WHERE r.fecha = %s AND r.id_turno = %s AND r.estado = 'activa'
                )
            """
            params.extend([fecha, id_turno])
        elif fecha:
            query += """
                AND s.nombre_sala NOT IN (
                    SELECT r.nombre_sala
                    FROM reserva r
                    WHERE r.fecha = %s AND r.estado = 'activa'
                )
            """
            params.append(fecha)
        elif id_turno:
            query += """
                AND s.nombre_sala NOT IN (
                    SELECT r.nombre_sala
                    FROM reserva r
                    WHERE r.id_turno = %s AND r.estado = 'activa'
                )
            """
            params.append(id_turno)
        cur.execute(query, tuple(params)) # Ejecuta la consulta con los parámetros que guardamos en params como antes
        salas = cur.fetchall()

        if not salas:
            return {"mensaje": "No hay salas disponibles con los filtros dados"}

        return {
            "salas_disponibles": salas
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass
