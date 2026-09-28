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

const primerUsuario = primero<Usuario>(usuariosLocales);
const primerNumero  = primero([1, 2, 3]);


console.log("=== Paso 2: genérico <T> ===");
console.log(saludar(usuariosLocales[0]));
console.log("primero<Usuario>:", primerUsuario?.nombre);
console.log("primero<number>: ", primerNumero);

export {};
