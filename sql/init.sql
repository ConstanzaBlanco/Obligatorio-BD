DROP DATABASE IF EXISTS gestion_salas;
CREATE DATABASE gestion_salas;
USE gestion_salas;

-- Tabla de login
CREATE TABLE login (
    correo VARCHAR(100) PRIMARY KEY,
    contrasenia VARCHAR(255) NOT NULL,
    rol ENUM('Usuario','Bibliotecario','Administrador') NULL DEFAULT NULL,
    last_access DATETIME,
    current_jti VARCHAR(36) NULL
);

-- Tabla de facultad
CREATE TABLE facultad (
    id_facultad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Tabla de programa_academico
CREATE TABLE programa_academico (
    nombre_programa VARCHAR(100) PRIMARY KEY,
    id_facultad INT NOT NULL,
    tipo ENUM('grado','posgrado') NOT NULL,
    FOREIGN KEY (id_facultad) REFERENCES facultad(id_facultad)
);

-- Tabla de participante
CREATE TABLE participante (
    ci BIGINT NOT NULL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    FOREIGN KEY (email) REFERENCES login(correo)
        ON UPDATE CASCADE
);

-- Tabla participante_programa_academico
CREATE TABLE participante_programa_academico (
    id_alumno_programa INT AUTO_INCREMENT PRIMARY KEY,
    ci_participante BIGINT NOT NULL,
    nombre_programa VARCHAR(100) NOT NULL,
    rol ENUM('alumno','docente') NOT NULL,
    FOREIGN KEY (ci_participante) REFERENCES participante(ci),
    FOREIGN KEY (nombre_programa) REFERENCES programa_academico(nombre_programa)
);

-- Tabla de edificio 
CREATE TABLE edificio (
    nombre_edificio VARCHAR(100) PRIMARY KEY,
    id_facultad INT NOT NULL,
    direccion VARCHAR(200),
    departamento VARCHAR(100),
    habilitado BOOLEAN NOT NULL DEFAULT TRUE,   
    FOREIGN KEY (id_facultad) REFERENCES facultad(id_facultad)
);

-- Tabla de Sala
CREATE TABLE sala (
    nombre_sala VARCHAR(100),
    edificio VARCHAR(100),
    capacidad INT NOT NULL,
    tipo_sala ENUM('libre','posgrado','docente') NOT NULL,
    habilitada BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (nombre_sala, edificio),
    FOREIGN KEY (edificio) REFERENCES edificio(nombre_edificio)
);

-- Tabla de turno
CREATE TABLE turno (
    id_turno INT AUTO_INCREMENT PRIMARY KEY,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL
);

-- Tabla de reserva
CREATE TABLE reserva (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    nombre_sala VARCHAR(100) NOT NULL,
    edificio VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    id_turno INT NOT NULL,
    estado ENUM('activa','cancelada','sin asistencia','finalizada') NOT NULL,
    creador BIGINT NOT NULL,
    FOREIGN KEY (nombre_sala, edificio) REFERENCES sala(nombre_sala, edificio),
    FOREIGN KEY (id_turno) REFERENCES turno(id_turno),
    FOREIGN KEY (creador) REFERENCES participante(ci)
);

-- Tabla reserva_participante
CREATE TABLE reserva_participante (
    ci_participante BIGINT NOT NULL,
    id_reserva INT NOT NULL,
    fecha_solicitud_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
    asistencia BOOLEAN DEFAULT FALSE,
    estado_invitacion ENUM('pendiente','aceptada','rechazada','creador') NOT NULL DEFAULT 'aceptada',
    PRIMARY KEY (ci_participante, id_reserva),
    FOREIGN KEY (ci_participante) REFERENCES participante(ci),
    FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva)
);

-- Tabla sancion_participante
CREATE TABLE sancion_participante (
    ci_participante BIGINT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    PRIMARY KEY (ci_participante, fecha_inicio, fecha_fin),
    FOREIGN KEY (ci_participante) REFERENCES participante(ci)
);

-- Facultades
INSERT INTO facultad (nombre) VALUES
('Ingenieria'),
('Ciencias'),
('Derecho'),
('Economia');

-- Edificios 
INSERT INTO edificio (nombre_edificio, id_facultad, direccion, departamento, habilitado) VALUES
('Central', 1, 'Av. Principal 123', 'Montevideo', TRUE),
('Sur', 2, 'Calle Secundaria 45', 'Canelones', TRUE),
('Norte', 3, 'Av. Legal 456', 'Maldonado', TRUE),
('Este', 4, 'Calle Financiera 89', 'Colonia', TRUE);


-- INSERT SALAS
INSERT INTO sala (nombre_sala, edificio, capacidad, tipo_sala, habilitada) VALUES
('Sala A', 'Central', 10, 'libre', TRUE),
('Sala B', 'Sur', 20, 'posgrado', TRUE),
('Sala C', 'Norte', 15, 'docente', TRUE),
('Sala D', 'Este', 25, 'libre', TRUE),
('Sala E', 'Central', 12, 'posgrado', TRUE);

-- Turnos
INSERT INTO turno (hora_inicio, hora_fin) VALUES
('08:00:00', '09:00:00'),
('09:00:00', '10:00:00'),
('10:00:00', '11:00:00'),
('11:00:00', '12:00:00'),
('12:00:00', '13:00:00'),
('13:00:00', '14:00:00'),
('14:00:00', '15:00:00'),
('15:00:00', '16:00:00'),
('16:00:00', '17:00:00'),
('17:00:00', '18:00:00'),
('18:00:00', '19:00:00'),
('19:00:00', '20:00:00'),
('20:00:00', '21:00:00'),
('21:00:00', '22:00:00'),
('22:00:00', '23:00:00');

-- Login
INSERT INTO login (correo, contrasenia, rol) VALUES
('juan.perez@ucu.edu.uy', '123456', 'Usuario'),
('maria.gomez@ucu.edu.uy', 'abcdef', 'Usuario'),
('ana.lopez@ucu.edu.uy', '$2b$12$FLBMHPrLRxW5odbuGVGUVezabc.i/EyC9XvhyZY4syAljzhEXrVHq', 'Usuario'),
('carlos.mendez@ucu.edu.uy', 'cmz123', 'Usuario'),
('sofia.ruiz@ucu.edu.uy', 'sfrz', 'Usuario'),
('jorge.diaz@ucu.edu.uy', 'jd123', 'Usuario'),
('biblio@ucu.edu.uy', '$2b$12$AEoMbeFCBivFTp6T5B0d5uB6zanKNo3PsZTh9fehJKNZyZjYNWioG', 'Bibliotecario'),
('admin@ucu.edu.uy', '$2b$12$AEoMbeFCBivFTp6T5B0d5uB6zanKNo3PsZTh9fehJKNZyZjYNWioG', 'Administrador');

-- Participantes
INSERT INTO participante (ci, nombre, apellido, email) VALUES
(12345678, 'Juan', 'Perez', 'juan.perez@ucu.edu.uy'),
(87654321, 'Maria', 'Gomez', 'maria.gomez@ucu.edu.uy'),
(11111111, 'Ana', 'Lopez', 'ana.lopez@ucu.edu.uy'),
(22222222, 'Carlos', 'Mendez', 'carlos.mendez@ucu.edu.uy'),
(33333333, 'Sofia', 'Ruiz', 'sofia.ruiz@ucu.edu.uy'),
(44444444, 'Jorge', 'Diaz', 'jorge.diaz@ucu.edu.uy'),
(99999999, 'Biblio', 'Tecario', 'biblio@ucu.edu.uy'),
(00000000, 'Admin', 'User', 'admin@ucu.edu.uy');

-- Programas académicos
INSERT INTO programa_academico (nombre_programa, id_facultad, tipo) VALUES
('Ingenieria Informatica', 1, 'grado'),
('Fisica Teorica', 2, 'posgrado'),
('Derecho Penal', 3, 'grado'),
('Economia Internacional', 4, 'posgrado');

-- Relación participante-programa
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, rol) VALUES
(12345678, 'Ingenieria Informatica', 'alumno'),
(87654321, 'Fisica Teorica', 'docente'),
(11111111, 'Ingenieria Informatica', 'docente'),
(22222222, 'Derecho Penal', 'alumno'),
(33333333, 'Economia Internacional', 'docente'),
(44444444, 'Fisica Teorica', 'alumno');

-- Reservas
INSERT INTO reserva (nombre_sala, edificio, fecha, id_turno, estado, creador) VALUES
('Sala A', 'Central', '2025-10-22', 1, 'activa', 12345678),
('Sala B', 'Sur', '2025-10-23', 2, 'finalizada', 12345678),
('Sala A', 'Central', '2025-10-24', 1, 'activa', 12345678),
('Sala A', 'Central', '2025-10-24', 2, 'finalizada', 12345678),
('Sala B', 'Sur', '2025-10-24', 3, 'cancelada', 12345678),
('Sala C', 'Norte', '2025-10-24', 1, 'finalizada', 12345678),
('Sala D', 'Este', '2025-10-24', 4, 'sin asistencia', 12345678),
('Sala D', 'Este', '2025-10-25', 1, 'activa', 12345678),
('Sala E', 'Central', '2025-10-25', 2, 'activa', 12345678);

-- Reserva-participante
INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, estado_invitacion) VALUES
(12345678, 1, TRUE, 'aceptada'),
(87654321, 2, FALSE, 'aceptada'),
(11111111, 3, TRUE, 'aceptada'),
(22222222, 3, TRUE, 'aceptada'),
(33333333, 4, TRUE, 'aceptada'),
(44444444, 5, FALSE, 'aceptada'),
(87654321, 6, TRUE, 'aceptada'),
(12345678, 7, FALSE, 'aceptada'),
(33333333, 8, TRUE, 'aceptada'),
(11111111, 9, FALSE, 'aceptada');

-- Sanciones
INSERT INTO sancion_participante (ci_participante, fecha_inicio, fecha_fin) VALUES
(12345678, '2025-11-01', '2025-11-07'),
(87654321, '2025-12-01', '2025-12-05'),
(11111111, '2025-10-20', '2025-10-25'),
(22222222, '2025-10-10', '2025-10-15'),
(33333333, '2025-09-01', '2025-09-05'),
(12345678, '2025-10-01', '2025-11-07');

CREATE USER 'Administrador'@'%' IDENTIFIED BY 'shaw';
CREATE USER 'Bibliotecario'@'%' IDENTIFIED BY 'shaw';
CREATE USER 'Usuario'@'%' IDENTIFIED BY 'shaw';

GRANT ALL PRIVILEGES ON gestion_salas.* TO 'Administrador'@'%';
GRANT ALL PRIVILEGES ON gestion_salas.* TO 'Bibliotecario'@'%';
GRANT ALL PRIVILEGES ON gestion_salas.* TO 'Usuario'@'%';
