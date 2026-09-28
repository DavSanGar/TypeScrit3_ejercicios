// @ts-nocheck
// ──────────────────────────────────────────────────────────────────
// PLANTILLA DEL ALUMNO — Clase 3: Funciones, genéricos y datos de Fetch
//
// `@ts-nocheck` está activado para que el archivo no rompa el build
// mientras trabajas en él. Cuando hayas completado todos los TODO,
// BORRA esta línea y comprueba que `npx tsc --noEmit` pasa sin errores.
// ──────────────────────────────────────────────────────────────────

// Tipos del proyecto, vienen de la Clase 2
type Rol = "admin" | "editor" | "lector";

interface Usuario {
  id: number;
  nombre: string;
  email?: string;
  rol: Rol;
}

// ─────────────────────────────────────────────────────────────
// Datos locales de respaldo (úsalos si el fetch falla)
// ─────────────────────────────────────────────────────────────

const usuariosLocales = [
  { id: 1, nombre: "Ana García",   email: "ana@ejemplo.com",   rol: "admin"  },
  { id: 2, nombre: "Bob Martín",   email: "bob@ejemplo.com",   rol: "editor" },
  { id: 3, nombre: "Carlos López",                              rol: "lector" },
  { id: 4, nombre: "Diana Torres", email: "diana@ejemplo.com", rol: "lector" },
  { id: 5, nombre: "Elena Ruiz",                                rol: "editor" },
];

// ─────────────────────────────────────────────────────────────
// (a) TODO: tipar filtrarPorRol
// ─────────────────────────────────────────────────────────────
//
// Esta función recibe un array de usuarios y un rol, y devuelve
// solo los usuarios que coincidan con ese rol.
//
// Pista: los tipos de los parámetros y el retorno deben anotarse.
// Cuando lo hayas anotado, TypeScript te avisará si pasas un rol
// que no existe (p.ej. "superusuario").

function filtrarPorRol(usuarios, rol) {
  // TODO: añade los tipos a `usuarios` y `rol`
  // TODO: añade el tipo de retorno
  return usuarios.filter((u) => u.rol === rol);
}

// ─────────────────────────────────────────────────────────────
// (b) TODO: fetch tipado — SIN `any`
// ─────────────────────────────────────────────────────────────
//
// La forma real de la respuesta de jsonplaceholder:

interface UsuarioAPI {
  id: number;
  name: string;
  email: string;
}

// TODO: escribe un type guard `esArrayDeUsuarioAPI(x: unknown): x is UsuarioAPI[]`
// que compruebe que x es un array cuyos elementos tienen id (number),
// name (string) y email (string).

// TODO: escribe `mapearUsuario(u: UsuarioAPI, indice: number): Usuario`
// que convierta la forma de la API en la forma del proyecto.
// Regla de rol: índice 0 → "admin", el resto → "lector".

// ─────────────────────────────────────────────────────────────
// ⚠️ TENTACIÓN que DEBES EVITAR:
//
//   const crudo = await res.json();   // tipo: any ← PELIGRO
//   crudo.campoInventado;              // TS no avisa
//
// En su lugar, anota como `unknown` y usa el type guard:
//
//   const crudo: unknown = await res.json();
//   if (!esArrayDeUsuarioAPI(crudo)) throw new Error("...");
//   // Aquí TS ya sabe que `crudo` es UsuarioAPI[]
// ─────────────────────────────────────────────────────────────

async function cargarYFiltrar() {
  // TODO: anota el tipo de retorno Promise<void>

  let usuarios; // TODO: anota el tipo Usuario[]

  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const crudo = await res.json(); // TODO: anota como `unknown`, no `any`

    // TODO: comprueba la forma con esArrayDeUsuarioAPI
    // TODO: si no pasa la comprobación, lanza un Error

    usuarios = crudo.slice(0, 5).map(mapearUsuario); // TODO: descomenta cuando tengas mapearUsuario
    console.log("Datos de la API.");
  } catch (err) {
    console.log("Sin red: usando datos locales");
    usuarios = usuariosLocales;
  }

  console.log("\nTodos:");
  usuarios.forEach((u) => {
    console.log(`  [${u.rol}] ${u.nombre}`);
  });

  console.log("\nAdmins:");
  // TODO: llama a filtrarPorRol con "admin" e imprime los resultados

  console.log("\nLectores:");
  // TODO: llama a filtrarPorRol con "lector" e imprime los resultados
}

console.log("=== Clase 3 — Inicio del ejercicio ===\n");
cargarYFiltrar();

export {};
