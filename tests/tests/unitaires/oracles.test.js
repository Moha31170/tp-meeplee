// Vérifie que l'oracle (tests/utils/oracles.js) est d'accord avec les tableaux
// de cas de tests/donnees/, un test par ligne, généré par une boucle.
// Exécution : npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as oracle from '../utils/oracles.js';

const ICI = dirname(fileURLToPath(import.meta.url));
const DOSSIER_DONNEES = join(ICI, '..', 'donnees');

function chargerCas(nomFichier) {
  return JSON.parse(readFileSync(join(DOSSIER_DONNEES, nomFichier), 'utf8'));
}

const FICHIERS_DE_CAS = [
  'cas-duree.json',      // RG-DUREE
  'cas-retard.json',     // RG-RETARD
  'cas-prolongation.json' // RG-PROLONGATION
];

for (const fichier of FICHIERS_DE_CAS) {
  const cas = chargerCas(fichier);
  for (const c of cas) {
    test(`[oracle] ${c.id} (${fichier}) — ${c.description}`, () => {
      const fonction = oracle[c.fn];
      assert.ok(typeof fonction === 'function', `Fonction inconnue dans l'oracle : ${c.fn}`);
      const resultat = fonction(...c.entree);
      assert.deepEqual(resultat, c.attendu);
    });
  }
}
