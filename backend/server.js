const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// CONEXIÓN A MYSQL
const db = mysql.createConnection({
  host: "localhost", 
  user: "root",
  password: "",
  database: "seguridad_bd"
});

db.connect(err => {
  if (err) throw err;
  console.log("Base de datos conectada");
});

// ENDPOINT LOGIN
app.post("/login", (req, res) => {
  const { usuario, password } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE usuario = ? AND password = ?",
    [usuario, password],
    (err, results) => {
      if (err) return res.status(500).json({ ok: false, error: err });

      if (results.length > 0) {
        res.json({ ok: true, mensaje: "Bienvenido" });
      } else {
        res.json({ ok: false, mensaje: "Usuario o contraseña incorrectos" });
      }
    }
  );
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
