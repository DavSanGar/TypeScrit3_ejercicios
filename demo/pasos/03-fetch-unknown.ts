type Rol = "admin" | "editor" | "lector";

interface Usuario {
  id: number;
  nombre: string;
  email?: string;
  rol: Rol;
}

const usuariosLocales: Usuario[] = [
  { id: 1, nombre: "Ana García",     email: "ana@ejemplo.com",   rol: "admin"  },
  { id: 2, nombre: "Carlos López",                                rol: "editor" },
  { id: 3, nombre: "María Martínez", email: "maria@ejemplo.com", rol: "lector" },
];

function saludar(u: Usuario): string {
  const extra = u.email ? ` <${u.email}>` : "";
  return `Hola, ${u.nombre}${extra} (rol: ${u.rol})`;
}

function primero<T>(lista: T[]): T | undefined {
  return lista[0];
}

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

function prueba() {
  const res = fetch("https://jsonplaceholder.typicode.com/users");
  const datos = res.then((res) => res.json());
}

console.log("=== Paso 3: fetch con unknown + type guard ===");
console.log(saludar(usuariosLocales[0]));
console.log("primero<Usuario>:", primero<Usuario>(usuariosLocales)?.nombre);
console.log("esArrayDeUsuarioAPI definida:", typeof esArrayDeUsuarioAPI);
console.log("mapearUsuario definida:", typeof mapearUsuario);

export {};
