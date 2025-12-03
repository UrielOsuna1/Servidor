// crypto.js
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function randomBytes(len) {
  const b = new Uint8Array(len);
  crypto.getRandomValues(b);
  return b;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function deriveKeyFromPassword(password, salt, iterations = 150000) {
  const passKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: "SHA-256"
    },
    passKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptText(plainText, password) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveKeyFromPassword(password, salt);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoder.encode(plainText)
  );

  const full = new Uint8Array(salt.length + iv.length + cipherBuffer.byteLength);
  full.set(salt, 0);
  full.set(iv, salt.length);
  full.set(new Uint8Array(cipherBuffer), salt.length + iv.length);

  return arrayBufferToBase64(full);
}

async function decryptCiphertext(base64Cipher, password) {
  const data = new Uint8Array(base64ToArrayBuffer(base64Cipher));
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const cipher = data.slice(28);

  const key = await deriveKeyFromPassword(password, salt);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    cipher
  );

  return decoder.decode(plainBuffer);
}
