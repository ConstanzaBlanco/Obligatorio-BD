from fastapi import APIRouter, Depends
from core.security import requireRole
from core.security import currentUser

router = APIRouter()

@router.get("/hora-servidor")
def hora_servidor():
    from datetime import datetime
    return {
        "hora_servidor": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
