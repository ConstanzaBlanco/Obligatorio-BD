from fastapi import APIRouter, Depends
from core.security import requireRole
from db.sanctionsSentences import getAllSanctions

router = APIRouter()

@router.get("/allSanctions")
def allSanctions():
    items = getAllSanctions()
    return {"items": items}