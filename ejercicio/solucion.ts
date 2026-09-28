// ============================================================
// Solución — Clase 3: Funciones, genéricos y datos de Fetch
// ============================================================

// (tipos del proyecto, vienen de la Clase 2)
type Rol = "admin" | "editor" | "lector";

interface Usuario {
  id: number;
  nombre: string;
  email?: string;
  rol: Rol;
}

// ─────────────────────────────────────────────────────────────
// Datos locales de respaldo
// (reflejan datos/usuarios.json; array inline para no requerir
//  resolveJsonModule en el tsconfig del proyecto)
// ─────────────────────────────────────────────────────────────

const usuariosLocales: Usuario[] = [
  { id: 1, nombre: "Ana García",     email: "ana@ejemplo.com",   rol: "admin"  },
  { id: 2, nombre: "Carlos López",                                rol: "editor" },
  { id: 3, nombre: "María Martínez", email: "maria@ejemplo.com", rol: "lector" },
  { id: 4, nombre: "Juan Sánchez",   email: "juan@ejemplo.com",  rol: "editor" },
  { id: 5, nombre: "Laura Pérez",                                 rol: "lector" },
];

// ─────────────────────────────────────────────────────────────
// (a) filtrarPorRol: función tipada
// ─────────────────────────────────────────────────────────────
//
// Parámetros anotados → TS comprueba que `rol` sea uno de los
// tres literales válidos. Si escribes "superusuario", error de compilación.
// Retorno anotado → TS verifica que .filter() devuelve Usuario[].

function filtrarPorRol(usuarios: Usuario[], rol: Rol): Usuario[] {
  return usuarios.filter((u) => u.rol === rol);
}

// ─────────────────────────────────────────────────────────────
// (b) Fetch tipado: unknown + type guard + respaldo local
// ─────────────────────────────────────────────────────────────

// Forma mínima de la respuesta de jsonplaceholder
interface UsuarioAPI {
  id: number;
  name: string;
  email: string;
}

// Type guard: comprueba la forma antes de confiar en los datos.
// Devolver `x is UsuarioAPI[]` permite a TS estrechar el tipo
// automáticamente en la rama del if — sin ningún cast.
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

// Convierte la forma de la API → forma del proyecto
// Regla de rol: primer usuario → "admin"; el resto → "lector"
function mapearUsuario(u: UsuarioAPI, indice: number): Usuario {
  return {
    id:     u.id,
    nombre: u.name,
    email:  u.email,
    rol:    indice === 0 ? "admin" : "lector",
  };
}

// ─────────────────────────────────────────────────────────────
// cargarYFiltrar — función principal del ejercicio
// ─────────────────────────────────────────────────────────────
//
// Promise<void>: esta función no devuelve datos, solo imprime.
// El try/catch garantiza que SIEMPRE hay datos (red o respaldo).

async function cargarYFiltrar(): Promise<void> {
  let usuarios: Usuario[];

  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // `unknown` → obliga a pasar por el type guard
    // `any`     → desactiva todas las comprobaciones ← NO usar
    const crudo: unknown = await res.json();

    if (!esArrayDeUsuarioAPI(crudo)) {
      throw new Error("Forma inesperada en la respuesta de la API");
    }

    // Aquí TS sabe que `crudo` es UsuarioAPI[] (gracias al type guard)
    usuarios = crudo.slice(0, 5).map(mapearUsuario);
    console.log("Datos cargados desde la API.\n");

  } catch (err) {
    console.log("Sin red: usando datos locales\n");
    usuarios = usuariosLocales;
  }

  // Listado completo
  console.log("Todos los usuarios:");
  usuarios.forEach((u) => {
    const emailStr = u.email ?? "(sin email)";
    console.log(`  [${u.rol}] ${u.nombre} — ${emailStr}`);
  });

  // (a) filtrarPorRol en acción
  console.log("\nSolo administradores:");
  const admins = filtrarPorRol(usuarios, "admin");
  admins.forEach((u) => console.log(`  · ${u.nombre}`));

  console.log("\nSolo lectores:");
  const lectores = filtrarPorRol(usuarios, "lector");
  lectores.forEach((u) => console.log(`  · ${u.nombre}`));

  console.log("\nSolo editores:");
  const editores = filtrarPorRol(usuarios, "editor");
  editores.forEach((u) => console.log(`  · ${u.nombre}`));
}

// ─────────────────────────────────────────────────────────────
// Punto de entrada
// ─────────────────────────────────────────────────────────────

console.log("=== Clase 3 — Solución del ejercicio ===\n");
cargarYFiltrar();

export {};
