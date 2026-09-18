// Lecture du rapport JSON de Playwright (--reporter=json) et extraction des échecs.
// Structure : { config, suites[], errors[], stats } ; une suite contient des specs
// et des sous-suites ; une spec contient des tests (un par projet) ; un test
// contient des results (un par tentative) avec errors[] et attachments[].
import fs from 'node:fs';
import path from 'node:path';

const ESC = String.fromCharCode(27);

// Retire les codes couleur du terminal présents dans les messages d'erreur.
export function sansCouleurs(texte) {
  return texte.split(ESC).map((m, i) => (i === 0 ? m : m.replace(/^\[[0-9;]*m/, ''))).join('');
}

export function lireRapport(chemin) {
  const rapport = JSON.parse(fs.readFileSync(chemin, 'utf8'));
  if (!rapport.suites || !rapport.stats) throw new Error(`${chemin} n'est pas un rapport JSON Playwright (clés suites et stats absentes).`);
  return rapport;
}

// Retrouve un fichier joint même si le rapport vient d'une autre machine :
// on tente le chemin absolu, puis test-results/<dossier>/<fichier> à côté du rapport.
function resoudrePieceJointe(cheminAbsolu, dossierRapport) {
  if (fs.existsSync(cheminAbsolu)) return cheminAbsolu;
  const relatif = path.join(dossierRapport, 'test-results', path.basename(path.dirname(cheminAbsolu)), path.basename(cheminAbsolu));
  return fs.existsSync(relatif) ? relatif : null;
}

// Contexte d'erreur (error-context.md) : on retire la section « Instructions »
// (destinée à un assistant) et on borne la taille pour maîtriser le coût.
function lireContexte(chemin, limite) {
  const texte = fs.readFileSync(chemin, 'utf8').replace(/^# Instructions[\s\S]*?(?=# Test info)/, '');
  return texte.length > limite ? `${texte.slice(0, limite)}\n[... contexte tronqué à ${limite} caractères]` : texte;
}

// Parcourt récursivement les suites et renvoie un tableau d'échecs normalisés.
export function extraireEchecs(rapport, { dossierRapport = '.', limiteContexte = 3500 } = {}) {
  const echecs = [];
  const parcourir = (suite, chemin) => {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests) {
        const derniere = test.results[test.results.length - 1];
        if (!derniere || !['failed', 'timedOut', 'interrupted'].includes(derniere.status)) continue;
        const contexte = derniere.attachments.find((a) => a.name === 'error-context');
        const capture = derniere.attachments.find((a) => a.name === 'screenshot');
        const cheminContexte = contexte ? resoudrePieceJointe(contexte.path, dossierRapport) : null;
        echecs.push({
          id: spec.id,
          titre: spec.title,
          cheminTitre: [...chemin, spec.title].join(' > '),
          fichier: spec.file,
          ligne: spec.line,
          projet: test.projectName,
          statut: derniere.status,
          dureeMs: derniere.duration,
          tentatives: test.results.length,
          message: derniere.errors.map((e) => sansCouleurs(e.message)).join('\n\n'),
          contexte: cheminContexte ? lireContexte(cheminContexte, limiteContexte) : null,
          preuve: { capture: capture?.path ?? null, contexte: cheminContexte }
        });
      }
    }
    for (const sous of suite.suites || []) parcourir(sous, [...chemin, sous.title]);
  };
  for (const suite of rapport.suites) parcourir(suite, []);
  return echecs;
}
