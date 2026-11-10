import { defineConfig } from 'astro/config';
import { execSync } from 'node:child_process';

/**
 * Número de WhatsApp según la rama que se construye:
 *  - main (producción, lo que ve el cliente): NUMERO_PRODUCCION
 *  - cualquier otra rama (dev, feature/*): NUMERO_PRUEBAS
 * La rama sale de Cloudflare (WORKERS_CI_BRANCH / CF_PAGES_BRANCH) o, en local, de git.
 * Si no se puede saber la rama, se usa el de producción (lo más seguro).
 */
const NUMERO_PRODUCCION = '51936688729';
const NUMERO_PRUEBAS = '51967446580';

function ramaActual() {
  const ci = process.env.WORKERS_CI_BRANCH || process.env.CF_PAGES_BRANCH;
  if (ci) return ci;
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
}

const rama = ramaActual();
const esPruebas = rama !== '' && rama !== 'main' && rama !== 'HEAD';
const numero = process.env.WHATSAPP_NUMBER_OVERRIDE || (esPruebas ? NUMERO_PRUEBAS : NUMERO_PRODUCCION);
console.log(`[vlirio] rama "${rama || 'desconocida'}" → WhatsApp ${numero}`);

export default defineConfig({
  devToolbar: { enabled: false },
  vite: {
    define: { __WHATSAPP_NUMBER__: JSON.stringify(numero) },
  },
});
