#!/usr/bin/env node
// Cartographie d'une page de Meeple, pour écrire des localisateurs sans les inventer.
// Usage : node scripts/cartographier.js /index.html
//         node scripts/cartographier.js /mes-emprunts.html testeur@exemple.fr
// Affiche l'instantané d'accessibilité de la page (rôles et noms, tels que Playwright les
// voit), puis la liste des éléments interactifs avec id, data-testid et étiquette reliée.
// Si rien n'écoute sur le port, démarre l'application école (../app/serveur.js) le temps
// de la capture. Variable PORT respectée (défaut 4200).
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { connecter } from '../tests/utils/auth.js';

const PORT = Number(process.env.PORT) || 4200;
const URL_DE_BASE = `http://localhost:${PORT}`;
const [chemin = '/index.html', email] = process.argv.slice(2);

async function serveurRepond() {
  try {
    const reponse = await fetch(`${URL_DE_BASE}/index.html`);
    return reponse.ok;
  } catch {
    return false;
  }
}

let processusServeur = null;
if (!(await serveurRepond())) {
  const serveur = fileURLToPath(new URL('../../app/serveur.js', import.meta.url));
  if (!existsSync(serveur)) {
    console.error(`Aucune application sur ${URL_DE_BASE} et serveur introuvable (${serveur}).`);
    process.exit(1);
  }
  processusServeur = spawn(process.execPath, [serveur], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
  for (let essai = 0; essai < 50 && !(await serveurRepond()); essai++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

const navigateur = await chromium.launch();
const page = await navigateur.newPage({ baseURL: URL_DE_BASE, viewport: { width: 1280, height: 720 }, locale: 'fr-FR', timezoneId: 'Europe/Paris' });

try {
  if (email) await connecter(page, email); // session injectée dans le localStorage
  await page.goto(chemin);
  await page.waitForLoadState('networkidle');

  console.log(`# ${await page.title()} — ${page.url()}${email ? ` — connecté : ${email}` : ''}`);
  console.log('\n## Instantané d\'accessibilité (rôles et noms accessibles vus par Playwright)\n');
  console.log(await page.locator('body').ariaSnapshot());

  console.log('\n## Éléments interactifs (id, data-testid, étiquette reliée par label)\n');
  const elements = await page.evaluate(() => {
    const cibles = document.querySelectorAll('a[href], button, input, select, textarea, [role]');
    return Array.from(cibles).map((element) => ({
      balise: element.tagName.toLowerCase(),
      type: element.getAttribute('type') || '',
      id: element.id || '',
      testid: element.getAttribute('data-testid') || '',
      etiquette: element.labels && element.labels.length ? element.labels[0].textContent.trim() : '',
      texte: (element.textContent || element.value || '').trim().replace(/\s+/g, ' ').slice(0, 40),
      cache: element.hidden || element.closest('[hidden]') !== null,
      desactive: element.disabled === true
    }));
  });
  console.table(elements);
  console.log('\nRepère à retenir : rôle + nom accessible, sinon étiquette reliée, sinon data-testid, sinon id.');
} finally {
  await navigateur.close();
  if (processusServeur) processusServeur.kill();
}
