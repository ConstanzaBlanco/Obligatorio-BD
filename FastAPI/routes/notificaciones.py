from fastapi import APIRouter, Depends
from core.security import currentUser
from db.notificationSentences import (
    getNotifications, markAsRead, markAllAsRead, countUnread
)

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])


@router.get("/")
def listar(user=Depends(currentUser)):
    roleDb = user["rol"]
    ci = user["ci"]
    return {"notificaciones": getNotifications(ci, roleDb)}


@router.get("/sinLeer")
def sin_leer(user=Depends(currentUser)):
    roleDb = user["rol"]
    ci = user["ci"]
    return {"unread": countUnread(ci, roleDb)}


@router.post("/marcarLeida/{id_notif}")
def leer(id_notif: int, user=Depends(currentUser)):
    roleDb = user["rol"]
    return {"modificadas": markAsRead(id_notif, roleDb)}


@router.post("/marcarTodasLeidas")
def leer_todas(user=Depends(currentUser)):
    roleDb = user["rol"]
    ci = user["ci"]
    return {"modificadas": markAllAsRead(ci, roleDb)}
