from fastapi import FastAPI
from routes import proof
from routes import login
from routes import home
from routes import showAll 
from FastAPI.routes import dayReservations
from routes import weekReservations


app = FastAPI()

# --- Endpoints ---


@app.get("/")
def root():
    return {"status": "ok"}

app.include_router(proof.router)
app.include_router(login.router)
app.include_router(home.router)
app.include_router(showAll.router)
app.include_router(dayReservations.router)
