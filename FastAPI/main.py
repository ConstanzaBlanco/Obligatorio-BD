from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- Rutas existentes ---
from routes import proof
from routes import login
from routes import home
from routes import showAll 
from routes import dayReservations
from routes import weekReservations
from routes import me
from routes import changePassword
from routes import infoSalas
from routes import seeAllSanctions
from routes import turnos
from routes import previousReservations
from routes import seeOwnSanctions
from routes import seeOwnActiveReservations
from routes import agregarReserva
from routes import cancelarReserva
from routes import seePastAndActiveReservations
from routes import createSalas
from routes import seeAllReservations
from routes import assistReservation

# --- ADMIN ---
from routes import CreateBiblio
from routes import changeRolOfUser
from routes import deleteUserLogical

# --- NUEVO: FACULTAD ---
from routes import facultad

app = FastAPI()

# --- Habilitar CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # dominio del frontend (Vite)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoint raíz ---
@app.get("/")
def root():
    return {"status": "ok"}

# --- routers generales ---
app.include_router(proof.router)
app.include_router(login.router)
app.include_router(home.router)
app.include_router(showAll.router)
app.include_router(dayReservations.router)
app.include_router(me.router)
app.include_router(changePassword.router)
app.include_router(infoSalas.router)
app.include_router(seeAllSanctions.router)
app.include_router(weekReservations.router)
app.include_router(turnos.router)
app.include_router(previousReservations.router)
app.include_router(seeOwnSanctions.router)
app.include_router(seeOwnActiveReservations.router)
app.include_router(agregarReserva.router)
app.include_router(cancelarReserva.router)
app.include_router(seePastAndActiveReservations.router)
app.include_router(createSalas.router)
app.include_router(seeAllReservations.router)
app.include_router(assistReservation.router)

# --- routers admin ---
app.include_router(CreateBiblio.router)
app.include_router(changeRolOfUser.router)
app.include_router(deleteUserLogical.router)

# --- router facultad ---
app.include_router(facultad.router)
