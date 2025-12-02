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

    const respuesta = await fetch("https://servidorosuna.ngrok.pro/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, hash })
    });

    const data = await respuesta.json();

    const resultDiv = document.getElementById("resultado");
    const btnIrLogin = document.getElementById("btnIrLogin");

    resultDiv.style.display = "block";
    resultDiv.innerHTML = data.mensaje;

    if (data.ok) {
      // Mostrar botón para ir al login
      btnIrLogin.style.display = "inline-block";
    } else {
      btnIrLogin.style.display = "none";
    }

    formRegistro.reset();
  });

  // Acción del botón "Ir al Login"
  const btnIrLogin = document.getElementById("btnIrLogin");
  btnIrLogin.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

/* ===========================
   MANEJO DEL FORMULARIO DE LOGIN
   =========================== */
const formLogin = document.getElementById("formLogin");

if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value;

    const hash = await hashSHA256(password);

    try {
      const respuesta = await fetch("https://servidorosuna.ngrok.pro/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, hash })
      });

      // si el backend devuelve error HTTP, aún lo leemos
      const data = await respuesta.json();

      const resultDiv = document.getElementById("resultado");
      if (data.ok) {
        // LOGIN CORRECTO → redirige inmediatamente
        window.location.href = "home.html";
        return;
      } else {
        // LOGIN INCORRECTO → muestra mensaje (si existe el contenedor)
        if (resultDiv) {
          resultDiv.style.display = "block";
          resultDiv.innerHTML = "<span style='color:red'>Usuario o contraseña incorrectos</span>";
        } else {
          alert("Usuario o contraseña incorrectos");
        }
      }
    } catch (err) {
      console.error("Error comunicándose con el servidor:", err);
      const resultDiv = document.getElementById("resultado");
      if (resultDiv) {
        resultDiv.style.display = "block";
        resultDiv.innerHTML = "<span style='color:red'>Error de conexión con el servidor</span>";
      } else {
        alert("Error de conexión con el servidor");
      }
    }
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
