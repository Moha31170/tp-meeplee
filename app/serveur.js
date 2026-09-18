// Serveur de fichiers statiques pour l'application école Meeple.
// Aucune dépendance : uniquement les modules intégrés de Node.js.
// Lancement : node serveur.js   (port 4200, ou la variable d'environnement PORT)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT) || 4200;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const serveur = createServer(async (requete, reponse) => {
  // "/" devient "/index.html" ; on retire la partie "?..." de l'URL.
  const chemin = requete.url.split('?')[0].replace(/\/$/, '/index.html');
  const fichier = join(RACINE, normalize(chemin));
  try {
    const contenu = await readFile(fichier);
    reponse.writeHead(200, {
      'Content-Type': TYPES[extname(fichier)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    reponse.end(contenu);
  } catch {
    reponse.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    reponse.end('Fichier introuvable : ' + chemin);
  }
  console.log(`${requete.method} ${chemin} -> ${reponse.statusCode}`);
});

serveur.listen(PORT, () => {
  console.log(`Meeple démarré sur http://localhost:${PORT}`);
});
