// Convierte ArrayBuffer → HEX
function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

// Genera SHA-256
async function hashSHA256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hash);
}

/* ===========================
   MANEJO DEL FORMULARIO DE REGISTRO
   =========================== */
const formRegistro = document.getElementById("formRegistro");

if (formRegistro) {
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;

    if (password !== confirm) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const hash = await hashSHA256(password);

    // Enviar al backend
    const respuesta = await fetch("http://localhost:3000/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, hash })
    });

    const data = await respuesta.json();

    const resultDiv = document.getElementById("resultado");
    resultDiv.style.display = "block";
    resultDiv.innerHTML = data.mensaje;

    formRegistro.reset();
  });
}

/* ===========================
   MANEJO DEL FORMULARIO DE LOGIN
   =========================== */
const formLogin = document.getElementById("formLogin");

if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    const hash = await hashSHA256(password);

    // Enviar al backend
    const respuesta = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, hash })
    });

    const data = await respuesta.json();

    const resultDiv = document.getElementById("resultado");
    resultDiv.style.display = "block";
    resultDiv.innerHTML = data.mensaje;

    // Redirigir si el login es correcto
    if (data.ok) {
      window.location.href = "index.html";
    }

    formLogin.reset();
  });
}

/* ===========================
   SISTEMA DE NOMBRE (PANTALLA HOME)
   =========================== */
const display = document.getElementById("displayName");
const btnName = document.getElementById("btnName");
const btnReset = document.getElementById("btnReset");

function setName(name) {
  display.textContent = name || "invitado";
  document.title = `Bienvenido${name ? " — " + name : ""}`;
}

if (btnName) {
  btnName.addEventListener("click", () => {
    const name = prompt("¿Cómo quieres que te llamemos?", "Amigo");
    if (name !== null) {
      setName(name.trim());
      try {
        localStorage.setItem("welcome_name", name.trim() || "invitado");
      } catch (e) {}
    }
  });
}

if (btnReset) {
  btnReset.addEventListener("click", () => {
    try {
      localStorage.removeItem("welcome_name");
    } catch (e) {}
    setName("invitado");
  });
}

// Cargar nombre guardado
try {
  const saved = localStorage.getItem("welcome_name");
  if (saved) setName(saved);
} catch (e) {
  /* ignorar */
}
