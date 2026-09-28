# Ejercicio — Funciones tipadas y fetch sin `any`

## De dónde partimos

En la demo de la Clase 3 vimos cómo anotar los tipos de parámetros y retorno de una función, y cómo consumir datos de una API de forma segura usando `unknown` + un type guard en lugar de `any`. Ahora es tu turno de practicar exactamente eso.

---

## Tu objetivo

Completarás dos partes en `inicio.ts`:

**(a)** Tipar la función `filtrarPorRol` para que TypeScript detecte en tiempo de compilación si alguien pasa un rol inventado.

**(b)** Realizar un fetch cuya respuesta se anote como `unknown` y se valide con un type guard propio, sin usar `any` en ningún momento.

---

## Archivos

- **Trabaja en:** `clase-3-funciones-fetch/ejercicio/inicio.ts`
  Lo primero que debes hacer al abrir el archivo es **borrar la línea `// @ts-nocheck`** del principio. Mientras esté ahí, TypeScript ignora todos los errores y no te ayuda a nada.
- **Referencia:** `clase-3-funciones-fetch/ejercicio/solucion.ts`
  Mírala solo si llevas un rato bloqueado de verdad. El objetivo es que llegues tú solo.

---

## Pasos

1. Abre `inicio.ts` y **borra `// @ts-nocheck`** en la primera línea. Tu editor empezará a subrayar en rojo los TODOs: eso es bueno, es TypeScript trabajando para ti.

2. **Anota `filtrarPorRol`:** añade `usuarios: Usuario[]` y `rol: Rol` como tipos de los parámetros, y `Usuario[]` como tipo de retorno. Cuando lo hagas, prueba a llamar a la función con `"superusuario"` y confirma que TS te da error de compilación.

3. **Escribe el type guard** `esArrayDeUsuarioAPI(x: unknown): x is UsuarioAPI[]`. Debe comprobar que `x` es un array y que cada elemento tiene `id` (`number`), `name` (`string`) y `email` (`string`).

4. **Escribe el mapeador** `mapearUsuario(u: UsuarioAPI, indice: number): Usuario`. Convierte la forma de la API (`name`) a la del proyecto (`nombre`). Regla de rol: índice `0` → `"admin"`, el resto → `"lector"`.

5. **Completa `cargarYFiltrar`:**
   - Anota `crudo` como `unknown` (no como `any`).
   - Usa el type guard justo después de obtener `crudo`; si no pasa, lanza un `Error`.
   - Anota la variable `usuarios` como `Usuario[]`.

6. **Completa el bloque `catch`:** asigna `usuariosLocales` a `usuarios` e imprime `"Sin red: usando datos locales"`.

7. **Después del try/catch**, llama a `filtrarPorRol` para `"admin"` y para `"lector"` e imprime cada grupo.

8. Ejecuta `npx tsc --noEmit` y comprueba que no hay errores. Después ejecuta tu archivo con `npx tsx clase-3-funciones-fetch/ejercicio/inicio.ts`.

---

## Pistas progresivas 💡

<details>
<summary>💡 Pista 1 — un empujón suave</summary>

Para **(a)**: `Rol` ya está definido como un tipo unión de literales. Cuando lo uses como tipo del parámetro `rol`, TypeScript sabrá exactamente qué valores son válidos y rechazará cualquier otro en tiempo de compilación.

Para **(b)**: el propósito del type guard es que TypeScript pueda "confiar" en un valor de tipo `unknown`. La firma del guard le dice al compilador: "si esta función devuelve `true`, el valor YA ES de este tipo concreto". Esto se llama *narrowing* (estrechamiento de tipo).

</details>

<details>
<summary>💡 Pista 2 — más concreta</summary>

La firma del type guard es:
```ts
function esArrayDeUsuarioAPI(x: unknown): x is UsuarioAPI[]
```

Dentro, empieza comprobando si `x` es un array con `Array.isArray(x)`, y luego itera con `.every()` para verificar que cada elemento tiene los campos correctos usando `typeof`.

En `cargarYFiltrar`, la línea clave es esta:
```ts
const crudo: unknown = await res.json();
```
Sin esa anotación `: unknown`, TypeScript infiere `any` desde `res.json()` y ya no te protege de nada.

</details>

<details>
<summary>💡 Pista 3 — casi te lo doy</summary>

La estructura del type guard sigue este esquema (los `...` son lo que tú completas):

```ts
function esArrayDeUsuarioAPI(x: unknown): x is UsuarioAPI[] {
  if (!Array.isArray(x)) return false;
  return x.every((item) => {
    if (typeof item !== "object" || item === null) return false;
    const obj = item as Record<string, unknown>;
    return (
      typeof obj["id"]    === ... &&
      typeof obj["name"]  === ... &&
      typeof obj["email"] === ...
    );
  });
}
```

Para el mapeador: `rol: indice === 0 ? "admin" : "lector"`.

Y en `cargarYFiltrar`, el patrón de uso del guard es:
```ts
if (!esArrayDeUsuarioAPI(crudo)) {
  throw new Error("Forma inesperada");
}
// A partir de aquí TS sabe que crudo es UsuarioAPI[]
usuarios = crudo.slice(0, 5).map(mapearUsuario);
```

</details>

---

## ✅ Sabes que terminaste cuando…

- [ ] Has borrado `// @ts-nocheck` de `inicio.ts`.
- [ ] `npx tsc --noEmit` pasa **sin errores**.
- [ ] `npx tsx clase-3-funciones-fetch/ejercicio/inicio.ts` imprime la lista completa de usuarios, el grupo de admins y el grupo de lectores.
- [ ] Si el fetch falla (o si lo pruebas sin red), el programa imprime `"Sin red: usando datos locales"` y continúa sin romperse.
- [ ] No hay ningún `any` en tu código (ni explícito ni implícito por omitir la anotación en `crudo`).
- [ ] Si intentas llamar a `filtrarPorRol(usuarios, "superusuario")`, TypeScript da error de compilación (el tipo te protege).

Comandos exactos para verificar:

```bash
# Comprobar tipos (todo el proyecto)
npx tsc --noEmit

# Ejecutar tu solución
npx tsx clase-3-funciones-fetch/ejercicio/inicio.ts

# Comparar con la solución de referencia
npx tsx clase-3-funciones-fetch/ejercicio/solucion.ts
```

---

## ⚠️ Errores comunes

1. **No borrar `// @ts-nocheck`** — si la línea sigue ahí, TypeScript ignora todos los errores y `tsc --noEmit` pasa aunque tu código esté mal. Es la primera cosa que debes borrar.

2. **`crudo` queda como `any`** — `res.json()` devuelve `any` por defecto. Si no escribes `const crudo: unknown = ...`, TypeScript no te va a exigir el type guard y parecerá que todo va bien aunque hayas dejado un agujero de seguridad de tipos.

3. **Acceder a propiedades de `crudo` antes del type guard** — TypeScript dirá algo como `"Property 'X' does not exist on type 'unknown'"`. La solución es pasar primero por el guard; solo entonces el compilador sabe cuál es la forma del dato.

4. **Olvidar el caso `null` en el type guard** — `typeof null === "object"` en JavaScript, así que dentro del `.every()` hay que comprobar explícitamente `item === null` antes de tratar el elemento como un objeto con campos.

5. **`filtrarPorRol` sin tipo de retorno** — si no anotas `: Usuario[]` al final de la firma, TypeScript infiere el tipo por ti (que en este caso acierta), pero el ejercicio pide que lo anotes explícitamente para que se vea claro el contrato de la función.

---

## 🚀 Reto extra (opcional)

Si has terminado y quieres un poco más:

1. **Añade un tercer grupo:** filtra también por `"editor"` usando `filtrarPorRol` e imprímelo. Verifica que TypeScript acepta `"editor"` pero sigue rechazando `"superusuario"`.

2. **Escribe una función genérica propia:** crea `function primero<T>(arr: T[]): T | undefined` que devuelva el primer elemento de cualquier array (o `undefined` si está vacío). Úsala para imprimir el primer admin y el primer lector encontrados. Comprueba que funciona tanto con `Usuario[]` como con cualquier otro tipo de array.
   > Nota: usa solo el genérico básico `<T>`. No añadas `extends` ni utility types como `Pick` o `Partial` — esos los veremos en otra clase.
