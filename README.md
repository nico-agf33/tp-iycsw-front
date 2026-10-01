
## AgendaYA - Módulo 02: Gestión de Disponibilidad (Frontend & E2E)

Frontend (Next.js) del módulo de Disponibilidad y pruebas End-to-End (Cypress) 

#
## Estructura del Proyecto
- `src/`: Componentes y páginas 
- `cypress/e2e/`: Las 7 pruebas E2E
- `.env.local` / `cypress.config.js`: Archivos de configuración de entorno

#
## Ejecutar entorno

### Backend (SvelteKit)
En una terminal, desde el directorio raíz del proyecto:
\`\`\`bash
npm install
npm run dev
\`\`\`
*(Debe quedar escuchando en el puerto 5173).*

### Frontend (Next.js)
Desde otra terminal en la raíz de **este** repositorio:
\`\`\`bash
npm install
npm run dev
\`\`\`
*(Debe quedar escuchando en el puerto 3000).*

#
## Ejecución de Pruebas E2E (Cypress)

Desde una tercera terminal en la raíz de este proyecto:

- **Modo Interactivo (Recomendado):**
  \`\`\`bash
  npm run cy:open
  \`\`\`
  *(Selecciona "E2E Testing" y haz clic sobre los tests para ver el comportamiento en el navegador).*

- **Modo Consola (Headless):**
  \`\`\`bash
  npm run cy:run
  \`\`\`
  *(Cypress grabará automáticamente un video `.mp4` de cada ejecución en la carpeta `cypress/videos/` para uso como evidencia de entrega).*
  