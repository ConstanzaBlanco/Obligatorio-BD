from fastapi import APIRouter
from datetime import datetime, timedelta, timezone

router = APIRouter()

@router.get("/hora-servidor")
def hora_servidor():
    # Ajuste manual UTC-3 (Uruguay)
    uy_tz = timezone(timedelta(hours=-3))
    ahora_uy = datetime.now(uy_tz)

    return {
        "hora_servidor": ahora_uy.strftime("%Y-%m-%d %H:%M:%S"),
        "timezone": "UTC-3 (Uruguay)"
    }
