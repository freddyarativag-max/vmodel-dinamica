# Dinámica interactiva: Modelo en V (multi-equipo) — v1.1 (parametrizada)

**Sin respuestas quemadas.** El mapa de validación se pasa por URL en Base64 con el parámetro `?map=`.

## Generar el parámetro `?map=` (modo docente)
En consola del navegador:
```js
btoa(JSON.stringify({
  "req-sis":"t-acep",
  "req-sw":"t-sis",
  "dis-arq":"t-int",
  "dis-mod":"t-unit"
}))
```
Luego abrir la app con:
```
http://localhost:5173/?map=TU_CADENA_BASE64
```
En producción (Vercel/Netlify/GitHub Pages), el patrón es el mismo.

## Ejecutar
```bash
npm install
npm run dev
```

## Build y deploy
```bash
npm run build
# opcional: GitHub Pages
npm run deploy
```
(En Pages, selecciona la rama `gh-pages` en Settings → Pages).

## Notas
- Si **no** hay `?map=...`, la validación queda **deshabilitada** (modo estudiante) y las relaciones esperadas se ocultan.
- Puedes crear mapas distintos por curso o sesión cambiando el JSON antes de codificar.
