CREATE DATABASE IF NOT EXISTS telegram_bot;
USE telegram_bot;

CREATE TABLE IF NOT EXISTS clientes_telegram (
    id INT AUTO_INCREMENT PRIMARY KEY,
    telegram_id BIGINT,
    nombre VARCHAR(100),
    punto VARCHAR(50),
    descripcion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    rol ENUM('admin','tecnico','supervisor') DEFAULT 'tecnico'
);

CREATE TABLE IF NOT EXISTS reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    punto VARCHAR(50),
    falla TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente',
    tecnico VARCHAR(100) DEFAULT NULL,
    imagen VARCHAR(255) DEFAULT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS modulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE
);

CREATE TABLE IF NOT EXISTS permisos (
    id_usuario INT,
    id_modulo INT,
    PRIMARY KEY(id_usuario, id_modulo),
    FOREIGN KEY(id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY(id_modulo) REFERENCES modulos(id) ON DELETE CASCADE
);

-- Modulos Default Seed --
INSERT IGNORE INTO modulos (nombre) VALUES 
('Dashboard'), 
('Soporte'), 
('Operaciones'), 
('Personal'), 
('Administración');
