from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import requireRole

router = APIRouter()

@router.get("/todasLasSanciones")
def todas_las_sanciones(user=Depends(requireRole("Bibliotecario", "Administrador"))):
    roleDb = user["rol"]
    try:
        sanciones = getAllSanctions(roleDb)
        return {"sanciones": sanciones}
    except Exception as e:
        raise HTTPException(500, str(e))
