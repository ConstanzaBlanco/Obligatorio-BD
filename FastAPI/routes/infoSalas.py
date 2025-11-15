from fastapi import APIRouter, Depends
from core.security import requireRole
from db.roomSentences import getRooms

router = APIRouter()

@router.get("/infoRooms")
def infoRooms(user = Depends(requireRole("Administrador"))):
    items = getRooms()
    return {"items": items, "total": len(items)}