# Imagen base (3.13 con slim para que sea liviana)
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /code

# Dependencias del sistema mínimas (por si alguna lib las requiere)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# Instala dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo el código del proyecto
COPY . .

EXPOSE 8000

# Lanza FastAPI con Uvicorn (proyecto plano -> archivo main.py con app = FastAPI())
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
