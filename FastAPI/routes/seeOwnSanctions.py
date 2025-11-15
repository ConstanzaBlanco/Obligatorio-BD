from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser 

router = APIRouter()

@router.get("/seeOwnSanctions")
def seeOwnSanctions(user=Depends(currentUser)): 
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        #Obtener el correo del usuario autenticado
        correo = user["correo"]

        #Busco su ci a partir del correo
        cur.execute("""
            SELECT ci
            FROM participante
            WHERE correo = %s
        """, (correo,))
        participante = cur.fetchone()

        if not participante:
            return {"error": "No se encontró participante asociado a este usuario"}

        ci = participante["ci"]

        #Hago la consulta de sanciones del usuario segun el ci
        cur.execute("""
            SELECT 
                fecha_inicio,
                fecha_fin
            FROM sancion_participante
            WHERE ci_participante = %s
            ORDER BY fecha_inicio DESC
        """, (ci,))  # Parametrizamos para evitar Injections

        resp = cur.fetchall()

        # Si el usuario no tiene sanciones, es un capo :D
        if not resp:
            return {"mensaje": "El usuario no tiene sanciones registradas"}

        return {"sanciones_del_usuario": resp}

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cur.close() 
            cn.close()
        except:
            pass
