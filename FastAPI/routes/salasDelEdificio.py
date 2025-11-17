from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import requireRole


router = APIRouter()

@router.get("/salasDelEdificio")
def salas_del_edificio(
    edificio: str,
    fecha: str = None,        
    id_turno: int = None,
    user = Depends(requireRole("Usuario", "Bibliotecario", "Administrador"))    
):
    try:
        roleDb = user["rol"]
        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        # Validar que exista el edificio
        cur.execute("""
            SELECT 1
            FROM edificio
            WHERE nombre_edificio = %s
        """, (edificio,))
        
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="El edificio no existe")

        # queri base
        query = """
            SELECT s.nombre_sala, s.capacidad, s.tipo_sala
            FROM sala s
            WHERE s.edificio = %s
        """
        params = [edificio]

        # filtro de fecha y turno juntos
        if fecha and id_turno:
            query += """
                AND (s.nombre_sala, s.edificio) NOT IN (
                    SELECT r.nombre_sala, r.edificio
                    FROM reserva r
                    WHERE r.edificio = %s
                        AND r.fecha = %s
                        AND r.id_turno = %s
                        AND r.estado = 'activa'
                )
            """
            params.extend([edificio, fecha, id_turno])

        # filtro de solo fecha
        elif fecha:
            query += """
                AND (s.nombre_sala, s.edificio) NOT IN (
                    SELECT r.nombre_sala, r.edificio
                    FROM reserva r
                    WHERE r.edificio = %s
                        AND r.fecha = %s
                        AND r.estado = 'activa'
                )
            """
            params.extend([edificio, fecha])

        # filtro de solo id_turno
        elif id_turno:
            query += """
                AND (s.nombre_sala, s.edificio) NOT IN (
                    SELECT r.nombre_sala, r.edificio
                    FROM reserva r
                    WHERE r.edificio = %s
                        AND r.id_turno = %s
                        AND r.estado = 'activa'
                )
            """
            params.extend([edificio, id_turno])

        # Ejecutar la queri
        cur.execute(query, tuple(params))
        salas = cur.fetchall()

        if not salas:
            return {"mensaje": "No hay salas disponibles con esos filtros"}

        return {
            "edificio": edificio,
            "filtros_usados": {
                "fecha": fecha,
                "id_turno": id_turno
            },
            "salas": salas
        }

    except HTTPException:
        raise

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cur.close()
            cn.close()
        except:
            pass
