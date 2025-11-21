from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from db.connector import getConnection
from core.security import requireRole

router = APIRouter()

class EditarEdificioRequest(BaseModel):
    nombre_original: str
    nuevo_nombre_edificio: str | None = None  
    id_facultad: int | None = None
    direccion: str | None = None
    departamento: str | None = None
    habilitado: bool | None = None


@router.put("/editarEdificio")
def editar_edificio(data: EditarEdificioRequest, user=Depends(requireRole("Administrador"))):
    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        # Obtener edificio
        cur.execute("SELECT * FROM edificio WHERE nombre_edificio = %s", (data.nombre_original,))
        edif = cur.fetchone()

        if not edif:
            raise HTTPException(status_code=404, detail="El edificio no existe.")

        # Validar facultad (si se envía)
        if data.id_facultad is not None:
            cur.execute("SELECT * FROM facultad WHERE id_facultad = %s", (data.id_facultad,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="La facultad no existe.")

        # Si va a deshabilitar edificio, verificar salas habilitadas
        if data.habilitado is False:
            cur.execute("""
                SELECT COUNT(*) AS activas
                FROM sala
                WHERE edificio = %s AND habilitada = TRUE
            """, (data.nombre_original,))
            row = cur.fetchone()
            if row["activas"] > 0:
                raise HTTPException(
                    status_code=400,
                    detail="No se puede deshabilitar el edificio porque tiene salas habilitadas."
                )


        # Cambio de nombre del edificio

        nuevo_nombre = data.nuevo_nombre_edificio or data.nombre_original

        if nuevo_nombre != data.nombre_original:
            # Verificar que no exista otro edificio con ese nombre
            cur.execute("""
                SELECT 1 FROM edificio 
                WHERE nombre_edificio = %s
            """, (nuevo_nombre,))
            if cur.fetchone():
                raise HTTPException(
                    status_code=400,
                    detail="Ya existe un edificio con ese nombre."
                )

            # Cambiar el nombre → ON UPDATE CASCADE se ocupa del resto
            cur.execute("""
                UPDATE edificio
                SET nombre_edificio = %s
                WHERE nombre_edificio = %s
            """, (nuevo_nombre, data.nombre_original))

            cn.commit()


        # Actualizar otros campos
        campos = []
        valores = []

        if data.id_facultad is not None:
            campos.append("id_facultad = %s")
            valores.append(data.id_facultad)

        if data.direccion is not None:
            campos.append("direccion = %s")
            valores.append(data.direccion)

        if data.departamento is not None:
            campos.append("departamento = %s")
            valores.append(data.departamento)

        if data.habilitado is not None:
            campos.append("habilitado = %s")
            valores.append(data.habilitado)

        if campos:
            valores.append(nuevo_nombre)

            query = f"""
                UPDATE edificio
                SET {', '.join(campos)}
                WHERE nombre_edificio = %s
            """
            cur.execute(query, tuple(valores))
            cn.commit()

        return {
            "mensaje": "Edificio actualizado correctamente.",
            "nuevo_nombre_edificio": nuevo_nombre,
            "cambios": campos
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        try:
            cur.close()
            cn.close()
        except:
            pass
