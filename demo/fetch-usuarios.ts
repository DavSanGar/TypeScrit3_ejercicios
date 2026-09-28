type Rol = "admin" | "editor" | "lector";

interface Usuario {
  id: number;
  nombre: string;
  email?: string;
  rol: Rol;
}

type Estado = "cargando" | "exito" | "error";

const usuariosLocales: Usuario[] = [
  { id: 1, nombre: "Ana García",     email: "ana@ejemplo.com",   rol: "admin"  },
  { id: 2, nombre: "Carlos López",                                rol: "editor" },
  { id: 3, nombre: "María Martínez", email: "maria@ejemplo.com", rol: "lector" },
  { id: 4, nombre: "Juan Sánchez",   email: "juan@ejemplo.com",  rol: "editor" },
  { id: 5, nombre: "Laura Pérez",                                 rol: "lector" },
];

function saludar(u: Usuario): string {
  const extra = u.email ? ` <${u.email}>` : "";
  return `Hola, ${u.nombre}${extra} (rol: ${u.rol})`;
}

function primero<T>(lista: T[]): T | undefined {
  return lista[0];
}

const primerUsuario = primero<Usuario>(usuariosLocales);
const primerNumero  = primero([1, 2, 3]);

interface UsuarioAPI {
  id: number;
  name: string;
  email: string;
}

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

function mapearUsuario(u: UsuarioAPI, indice: number): Usuario {
  return {
    id:     u.id,
    nombre: u.name,
    email:  u.email,
    rol:    indice === 0 ? "admin" : "lector",
  };
}

async function cargarUsuarios(): Promise<Usuario[]> {
  let estado: Estado = "cargando";
  console.log("Estado:", estado);

  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");

    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    const crudo: unknown = await res.json();

    if (!esArrayDeUsuarioAPI(crudo)) {
      throw new Error("La respuesta de la API no tiene la forma esperada");
    }

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

console.log("=== Clase 3: Funciones, genéricos y datos de Fetch ===\n");

console.log("── PASO 1: Funciones tipadas ──");
console.log(saludar(usuariosLocales[0]));
console.log(saludar(usuariosLocales[1]));

console.log("\n── PASO 2: Genérico <T> ──");
console.log("primero<Usuario>:", primerUsuario?.nombre);
console.log("primero<number>: ", primerNumero);

console.log("\n── PASO 4: cargarUsuarios() → Promise<Usuario[]> ──\n");

cargarUsuarios().then((usuarios) => {
  console.log("\nUsuarios cargados:", usuarios.length);
  usuarios.forEach((u) => console.log(" ", saludar(u)));
});

export {};
