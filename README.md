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
## MySQL
**Usuario "INVITADO"**  
usuario: gestion_salas_user  
contraseña: shaw  

**Usuario "USUARIO"**  
usuario: Usuario  
contraseña: shaw  

**Usuario "BIBLIOTECARIO"**  
usuario: Bibliotecario  
contraseña: shaw  

**Usuario "ADMINISTRADOR"**  
usuario: Administrador  
contraseña: shaw  

**Usuario "ROOT"**  
usuario: root  
contraseña: rootpassword

## Usuarios
**Juan Perez – Alumno**  
correo: juan.perez@ucu.edu.uy  
contraseña: Juan123  

**Maria Gomez – Docente**  
correo: maria.gomez@ucu.edu.uy  
contraseña: Maria123  

**Ana Lopez – Docente**  
correo: ana.lopez@ucu.edu.uy  
contraseña: Ana1234  

**Carlos Mendez – Alumno**  
correo: carlos.mendez@ucu.edu.uy  
contraseña: Carlos123  

**Sofia Ruiz – Docente**  
correo: sofia.ruiz@ucu.edu.uy  
contraseña: Sofia123  

**Jorge Diaz – Alumno**  
correo: jorge.diaz@ucu.edu.uy  
contraseña: Jorge123  

**Bibliotecario – Bibliotecario**  
correo: biblio@ucu.edu.uy  
contraseña: Biblio  

**Administrador – Administrador**  
correo: admin@ucu.edu.uy  
contraseña: biblio


Las credenciales de prueba (usuarios y contraseñas) están detalladas en la documentación del proyecto.

---

## Notas

- Asegurate de que no haya otros servicios usando los puertos:
  - `5173` (Frontend)
  - `8000` (API)
  - `3306` (MySQL).
