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


        # VALIDAR EDIFICIO + SABER SI ESTÁ HABILITADO
        cur.execute("""
            SELECT habilitado
            FROM edificio
            WHERE nombre_edificio = %s
        """, (edificio,))
        
        edif = cur.fetchone()
        if not edif:
            raise HTTPException(status_code=404, detail="El edificio no existe")

        # Usuarios NO ven salas si el edificio está deshabilitado
        if roleDb == "Usuario" and not bool(edif["habilitado"]):
            return {"mensaje": "Este edificio está deshabilitado para reservas"}


        query = """
            SELECT 
                s.nombre_sala,
                s.capacidad,
                s.tipo_sala,
                s.habilitada
            FROM sala s
            WHERE s.edificio = %s
        """
        params = [edificio]

        # usuario ve solo salas habilitadas

        if roleDb == "Usuario":
            query += " AND s.habilitada = TRUE"


        # Filtros fecha y turno

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


        cur.execute(query, tuple(params))
        salas = cur.fetchall()

        if not salas:
            return {"mensaje": "No hay salas disponibles con esos filtros"}

        return {
            "edificio": edificio,
            "habilitado": edif["habilitado"],
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
