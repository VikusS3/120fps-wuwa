/**
 * Copia los benchmarks de escritorio de @pmndrs/detect-gpu a public/gpu-benchmarks
 * para que la aplicación no dependa de CDNs de terceros en tiempo de ejecución.
 *
 * Solo se copian los ficheros "d-*.json" (desktop). El proyecto es un comprobador
 * de hardware para PC, no para dispositivos móviles.
 */
import { readdir, mkdir, copyFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(root, '..');
const sourceDir = join(repoRoot, 'node_modules', '@pmndrs', 'detect-gpu', 'dist', 'benchmarks');
const targetDir = join(repoRoot, 'public', 'gpu-benchmarks');

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(sourceDir))) {
  console.warn('[gpu-benchmarks] Fuente no encontrada, se omite la copia:', sourceDir);
  process.exit(0);
}

await mkdir(targetDir, { recursive: true });

const files = (await readdir(sourceDir)).filter((name) => name.startsWith('d-') && name.endsWith('.json'));

for (const file of files) {
  await copyFile(join(sourceDir, file), join(targetDir, file));
}

console.log(`[gpu-benchmarks] ${files.length} ficheros copiados a public/gpu-benchmarks/`);
