// ============================================================
// Demo del profesor — Clase 3: Funciones, genéricos y datos de Fetch
// Proyecto hilo conductor: "Lista de usuarios"
// ============================================================

// ─────────────────────────────────────────────────────────────
// Tipos del proyecto, vienen de la Clase 2
// ─────────────────────────────────────────────────────────────

type Rol = "admin" | "editor" | "lector";

interface Usuario {
  id: number;
  nombre: string;
  email?: string;
  rol: Rol;
}

type Estado = "cargando" | "exito" | "error";

// ─────────────────────────────────────────────────────────────
// Datos locales de respaldo
// (reflejan el contenido de datos/usuarios.json — se usa si no hay red)
// Nota: el import de JSON requeriría "resolveJsonModule" en tsconfig
// y la sintaxis `with { type: "json" }`. Para mantener la clase
// autocontenida y sin fricción de config, definimos el array inline;
// datos/usuarios.json sigue siendo el material de referencia del guion.
// ─────────────────────────────────────────────────────────────

const usuariosLocales: Usuario[] = [
  { id: 1, nombre: "Ana García",     email: "ana@ejemplo.com",   rol: "admin"  },
  { id: 2, nombre: "Carlos López",                                rol: "editor" },
  { id: 3, nombre: "María Martínez", email: "maria@ejemplo.com", rol: "lector" },
  { id: 4, nombre: "Juan Sánchez",   email: "juan@ejemplo.com",  rol: "editor" },
  { id: 5, nombre: "Laura Pérez",                                 rol: "lector" },
];

// ─────────────────────────────────────────────────────────────
// PASO 1 — TIPAR FUNCIONES: anota lo que entra y lo que sale
// ─────────────────────────────────────────────────────────────
//
// La anotación de tipos en parámetros y en el retorno es la firma
// del contrato. TS verifica que el cuerpo lo cumpla; si coincide,
// el cuerpo se puede dejar sin más anotaciones (TS infiere).
//
//   Parámetro u: Usuario  → TS comprueba que pasamos un Usuario
//   Retorno : string      → TS comprueba que devolvemos un string

function saludar(u: Usuario): string {
  // u.email es string | undefined → usamos el operador ternario para narrowing
  const extra = u.email ? ` <${u.email}>` : "";
  return `Hola, ${u.nombre}${extra} (rol: ${u.rol})`;
}

// ─────────────────────────────────────────────────────────────
// PASO 2 — PRIMER GENÉRICO: <T>
// ─────────────────────────────────────────────────────────────
//
// Un genérico es un HUECO de tipo que se rellena al usar la función.
// T no es un tipo concreto: es un "comodín" que TS sustituye
// por el tipo real cuando se llama a la función.
//
//   primero<Usuario>(lista)  →  T = Usuario, devuelve Usuario | undefined
//   primero([1, 2, 3])       →  T inferido = number, devuelve number | undefined
//
// Sin genérico, tendríamos que escribir una función por cada tipo.
// Con <T>, una sola función sirve para cualquier lista.

function primero<T>(lista: T[]): T | undefined {
  return lista[0];
}

const primerUsuario = primero<Usuario>(usuariosLocales); // T = Usuario
const primerNumero  = primero([1, 2, 3]);                // T inferido = number

// ─────────────────────────────────────────────────────────────
// PASO 3 — EL PELIGRO DE `any` con fetch
// ─────────────────────────────────────────────────────────────
//
// `await res.json()` devuelve `any` por defecto.
// `any` APAGA TypeScript: el compilador ya no comprueba ese valor.
//
// TENTACIÓN (no copies esto en producción):
//
//   const datos = await res.json();   // tipo inferido: any
//   datos.campoInventado;              // TS no dice nada ← PELIGRO
//   datos.forEach(/* ... */);          // tampoco avisa ← PELIGRO
//
// Si la API cambia su estructura, el error explota en producción
// y TypeScript no habría avisado en tiempo de compilación.
//
// SOLUCIÓN: tipamos como `unknown` y usamos un TYPE GUARD.
// `unknown` OBLIGA a comprobar la forma antes de acceder a los datos.
// Si no comprobamos, TS nos impide seguir: es un error de compilación.
//
// La forma mínima que nos importa de la API de jsonplaceholder:

interface UsuarioAPI {
  id: number;
  name: string;
  email: string;
}

// Un type guard es una función que devuelve `x is TipoConcreto`.
// Cuando la llamamos dentro de un `if`, TS estrecha el tipo
// de `x` al tipo concreto en esa rama — sin ningún cast manual.

function esArrayDeUsuarioAPI(x: unknown): x is UsuarioAPI[] {
  if (!Array.isArray(x)) return false;
  return x.every((item) => {
    if (typeof item !== "object" || item === null) return false;
    const obj = item as Record<string, unknown>;
    return (
      typeof obj["id"]    === "number" &&
      typeof obj["name"]  === "string" &&
      typeof obj["email"] === "string"
    );
  });
}

// Mapea la forma de la API real → forma del proyecto
// Regla de rol: el primer usuario recibe "admin", el resto "lector"
function mapearUsuario(u: UsuarioAPI, indice: number): Usuario {
  return {
    id:     u.id,
    nombre: u.name,
    email:  u.email,
    rol:    indice === 0 ? "admin" : "lector",
  };
}

// ─────────────────────────────────────────────────────────────
// PASO 4 — Promise<Usuario[]> y await tipado
// ─────────────────────────────────────────────────────────────
//
// Una función `async` devuelve automáticamente una Promise.
// Anotar el retorno como Promise<Usuario[]> documenta el contrato
// y TypeScript verifica que SIEMPRE devolvamos Usuario[] (no string,
// no number, no nada más).
//
// `await` DESEMPAQUETA la Promise: si tienes Promise<Usuario[]>,
// `await` te da directamente Usuario[], sin .then() ni callbacks.
//
// El try/catch garantiza que la función SIEMPRE devuelve datos:
//   · Si el fetch tiene éxito  → usuarios de la API
//   · Si el fetch falla (sin red, error HTTP, forma inválida) → datos locales

async function cargarUsuarios(): Promise<Usuario[]> {
  let estado: Estado = "cargando";
  console.log("Estado:", estado);

  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");

    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    // Tipamos como `unknown`, NO como `any`
    // Esto obliga a pasar por el type guard antes de usar los datos
    const crudo: unknown = await res.json();

    if (!esArrayDeUsuarioAPI(crudo)) {
      throw new Error("La respuesta de la API no tiene la forma esperada");
    }

    // Aquí TS ya sabe que `crudo` es UsuarioAPI[] gracias al type guard
    // Solo tomamos los primeros 5 para no saturar la salida
    const usuarios = crudo.slice(0, 5).map(mapearUsuario);

    estado = "exito";
    console.log("Estado:", estado, "(datos de la API)");
    return usuarios;

  } catch (err) {
    estado = "error";
    console.log("Estado:", estado);
    console.log("Sin red: usando datos locales");
    return usuariosLocales;
  }
}

// ─────────────────────────────────────────────────────────────
// PASO 5 — Ejecutar y mostrar resultados
// ─────────────────────────────────────────────────────────────

console.log("=== Clase 3: Funciones, genéricos y datos de Fetch ===\n");

console.log("── PASO 1: Funciones tipadas ──");
console.log(saludar(usuariosLocales[0])); // con email
console.log(saludar(usuariosLocales[1])); // sin email → muestra la rama opcional

console.log("\n── PASO 2: Genérico <T> ──");
console.log("primero<Usuario>:", primerUsuario?.nombre);
console.log("primero<number>: ", primerNumero);

console.log("\n── PASO 4: cargarUsuarios() → Promise<Usuario[]> ──\n");

// Llamamos la función asíncrona; .then() recibe el Usuario[] desempaquetado
cargarUsuarios().then((usuarios) => {
  console.log("\nUsuarios cargados:", usuarios.length);
  usuarios.forEach((u) => console.log(" ", saludar(u)));
});

export {};
