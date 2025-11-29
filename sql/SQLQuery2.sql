-- Crear base de datos
CREATE DATABASE SistemaUsuarios;
GO

USE SistemaUsuarios;
GO

-- =========================================
-- Tabla REGISTRO
-- =========================================
CREATE TABLE Registro (
    ID_Usuario INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL,
    Contraseña NVARCHAR(255) NOT NULL
);
GO

-- =========================================
-- Tabla LOGIN
-- =========================================
CREATE TABLE Login (
    ID_Login INT IDENTITY(1,1) PRIMARY KEY,
    ID_Usuario INT NOT NULL,
    Nombre NVARCHAR(50) NOT NULL,
    Contraseña NVARCHAR(255) NOT NULL,

    -- Relación con Registro
    FOREIGN KEY (ID_Usuario) REFERENCES Registro(ID_Usuario)
);
GO
