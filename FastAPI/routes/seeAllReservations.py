from fastapi import APIRouter, Depends
from core.security import requireRole
from db.reservationSentences import getAllReservations

router = APIRouter()

def toList(cis):
    partes = cis.split(",")
    if isinstance(cis, str):
        limpia = []
        for p in partes:
            s = p.strip()
            if s != "":
                limpia.append(s)
        return limpia



@router.get("/allReservation")
def allSanctions(user=Depends(requireRole("Bibliotecario"))):
    items = getAllReservations()

    for r in items:
        r["cis"] = toList(r.get("cis"))

    return {"items": items, "total": len(items)}