import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = process.cwd();
const webDir = join(rootDir, 'www');

const filesToCopy = [
  'index.html',
  'callback.html',
  'styles.css',
  'app.js',
  'data.js',
  'gps.js',
  'strava.js',
  'runningtrainer.config.js'
];

if (existsSync(webDir)) {
  rmSync(webDir, { recursive: true, force: true });
}
mkdirSync(webDir, { recursive: true });

for (const file of filesToCopy) {
  cpSync(join(rootDir, file), join(webDir, file));
}

const assetsDir = join(rootDir, 'assets');
if (existsSync(assetsDir)) {
  cpSync(assetsDir, join(webDir, 'assets'), { recursive: true });
}

const iconCandidates = readdirSync(rootDir).filter((name) => /\.(png|jpg|jpeg|svg|ico|webp)$/i.test(name));
for (const iconFile of iconCandidates) {
  cpSync(join(rootDir, iconFile), join(webDir, iconFile));
}

console.log('Build web listo en /www');
