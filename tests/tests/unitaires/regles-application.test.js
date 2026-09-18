// Confronte l'oracle (écrit depuis la spécification) à l'implémentation de
// l'application, cas par cas. Un test rouge ici est noté : valeur attendue
// (oracle), valeur observée (application), règle concernée — jamais corrigé
// en modifiant l'oracle sans être revenu relire la spécification.
// Exécution : npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as oracle from '../utils/oracles.js';
import * as application from '../../../app/js/regles.js';
// formaterDate n'est pas exporté par regles.js (il vit dans dates.js) : on le
// confronte quand même, séparément, par souci de complétude.
import { formaterDate as formaterDateApplication } from '../../../app/js/dates.js';

const ICI = dirname(fileURLToPath(import.meta.url));
const DOSSIER_DONNEES = join(ICI, '..', 'donnees');

function chargerCas(nomFichier) {
  return JSON.parse(readFileSync(join(DOSSIER_DONNEES, nomFichier), 'utf8'));
}

const REGLE_PAR_FICHIER = {
  'cas-duree.json': 'RG-DUREE',
  'cas-retard.json': 'RG-RETARD',
  'cas-prolongation.json': 'RG-PROLONGATION'
};

for (const [fichier, regle] of Object.entries(REGLE_PAR_FICHIER)) {
  const cas = chargerCas(fichier);
  for (const c of cas) {
    test(`[confrontation ${regle}] ${c.id} (${fichier}) — ${c.description}`, () => {
      const fonctionApplication = c.fn === 'formaterDate'
        ? formaterDateApplication
        : application[c.fn];
      assert.ok(
        typeof fonctionApplication === 'function',
        `${regle} : app/js/regles.js n'exporte pas ${c.fn}`
      );

      const attendu = oracle[c.fn](...c.entree);
      const observe = fonctionApplication(...c.entree);

      assert.deepEqual(
        observe,
        attendu,
        `${regle} — ${c.id} : attendu ${JSON.stringify(attendu)}, observé ${JSON.stringify(observe)} (entrée ${JSON.stringify(c.entree)})`
      );
    });
  }
}
