<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dinámica Modelo en V</title>
    <link rel="icon" href="data:," />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

{
  "name": "vmodel-dinamica",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0"
  }
}
# Dinámica interactiva: Modelo en V (multi-equipo)

App web para actividades de aula (virtual/presencial) donde equipos arrastran tarjetas y emparejan fases ↔ pruebas del Modelo en V.

## Cómo ejecutar (Vite)
1. Requisitos: Node.js 18+ y npm.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Levantar en desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir el enlace que indica Vite (p. ej., http://localhost:5173).

## Despliegue
- **Vercel**: Importa el repo → Framework: Vite → Build: `npm run build` → Output: `dist/`.
- **Netlify**: Build: `npm run build` → Publish dir: `dist/`.
- **GitHub Pages**: `npm run build` y publica `dist/`.

## Uso en clase
- Agrega equipos (nombre + escenario) y comparte el enlace directo (botón “Abrir link”).
- Cada equipo arrastra tarjetas desde el banco a los slots de la “V” y pulsa **Validar**.
- Pueden **exportar** su resultado a JSON.
- La lista de equipos se guarda en `localStorage`.

## Puntuación
- +1 por cada emparejamiento correcto (4).
- +1 adicional si todas las tarjetas están colocadas.

## Escenarios incluidos
- Parqueaderos (Centro Comercial), Automotriz (ISO 26262), Médico (Signos vitales), Aeroespacial (Dron).

---
© Actividad educativa — Modelo en V

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
