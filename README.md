# Obligatorio BD – Instructivo de Instalación

## Requisitos

- Tener **Docker** instalado y Docker Compose.

---

## Instalación

1. **Clonar el repositorio**

   Podés obtener el link desde la página del proyecto en GitHub o clonar directamente con el siguiente URL:

   ```bash
   git clone https://github.com/ConstanzaBlanco/Obligatorio-BD.git
   ```

2. **Acceder al repositorio clonado**

   ```bash
   cd Obligatorio-BD
   ```

3. **Levantar los servicios con Docker**

   Ejecutar:

   ```bash
   docker-compose up
   ```

   Este comando va a:

   - Descargar automáticamente las imágenes y volúmenes necesarios.
   - Dockerizar:
     - La **API**
     - El **Frontend**
     - **MySQL**

   La base de datos MySQL se cargará automáticamente gracias a la configuración de Docker, que utiliza un archivo para cargar datos base.

---

## Acceso a la Aplicación

### Frontend

Para probar la aplicación completa, abrir en el navegador y poner el siguiente LINK:

```text
http://localhost:5173/
```

### API / Backend

Si querés probar directamente los endpoints de la API, podés usar:

```text
http://localhost:8000/
```

### Documentación de Endpoints (Swagger UI)

Para ver el listado completo de endpoints disponibles:

```text
http://localhost:8000/docs
```

> **Importante:**  
> Para probar la mayoría de los endpoints, es necesario contar con un **TOKEN**.  
> Ese token se obtiene realizando el **LOGIN** correspondiente en la aplicación.

---

## Credenciales de Prueba

Para probar la aplicación en su totalidad es necesario contar con credenciales de:

- **Administrador**
- **Bibliotecario**
- **Usuarios**

Las credenciales de prueba (usuarios y contraseñas) están detalladas en la documentación del proyecto.

---

## Notas

- Asegurate de que no haya otros servicios usando los puertos:
  - `5173` (Frontend)
  - `8000` (API)
  - `3306` (MySQL).
