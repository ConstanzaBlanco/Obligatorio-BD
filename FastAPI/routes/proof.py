from fastapi import APIRouter
router = APIRouter()

@router.get("/proof")
def proof():
    return {"status": "ok"}