from fastapi import FastAPI
from routes import proof
from routes import login
from routes import home

app = FastAPI()

# --- Endpoints ---


@app.get("/")
def root():
    return {"status": "ok"}

app.include_router(proof.router)
app.include_router(login.router)
app.include_router(home.router)
