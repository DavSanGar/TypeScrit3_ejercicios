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

console.log("=== Paso 1: funciones tipadas ===");
console.log(saludar(usuariosLocales[0]));
console.log(saludar(usuariosLocales[1]));

export {};
