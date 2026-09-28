async function prueba() {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  const datos: unknown = await res.json();
  console.log(datos.claudio);
  console.log(datos.hola)
}

prueba();

export {
}