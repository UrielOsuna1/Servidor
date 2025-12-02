const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ==================== SERVIR ARCHIVOS DEL FRONTEND ====================
app.use(express.static(path.join(__dirname, "public")));

// ==================== CONFIGURACIÓN DE SQL SERVER =====================
const config = {
    user: "sa",
    password: "12345678",
    server: "localhost",    // ← NO uses LAP-URI\SQLEXPRESS
    database: "SistemaUsuarios",
    port: 1433,
    options: {
        trustServerCertificate: true,
        encrypt: false
    }
};


// ==================== REGISTRO ====================
app.post("/registro", async (req, res) => {
    try {
        const { nombre, hash } = req.body;

        let pool = await sql.connect(config);

        await pool.request()
            .input("Nombre", sql.NVarChar(50), nombre)
            .input("Contraseña", sql.NVarChar(255), hash)
            .query(`
                INSERT INTO Registro (Nombre, Contraseña)
                VALUES (@Nombre, @Contraseña)
            `);

        res.json({ ok: true, mensaje: "Registro exitoso" });

    } catch (err) {
        console.log(err);
        res.json({ ok: false, mensaje: "Error en el servidor" });
    }
});

// ==================== LOGIN ====================
app.post("/login", async (req, res) => {
    try {
        
        console.log("POST /login body:", req.body);

        const { usuario, hash } = req.body;

        let pool = await sql.connect(config);

        let result = await pool.request()
            .input("Nombre", sql.NVarChar(50), usuario)
            .input("Contraseña", sql.NVarChar(255), hash)
            .query(`
                SELECT * 
                FROM Registro
                WHERE Nombre = @Nombre AND Contraseña = @Contraseña
            `);

        if (result.recordset.length > 0) {
            res.json({ ok: true, mensaje: "Login correcto" });
        } else {
            res.json({ ok: false, mensaje: "Usuario o contraseña incorrectos" });
        }

    } catch (err) {
        console.log(err);
        res.json({ ok: false, mensaje: "Error en el servidor" });
    }
});

// ================== INICIAR SERVIDOR ==================
app.listen(3000, () => {
    console.log("Servidor funcionando en http://localhost:3000");
});
