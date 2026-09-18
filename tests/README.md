# qa-front-meeple — projet de tests de l'application école Meeple

Projet de départ du TP de synthèse. Il contient la configuration Playwright, un test unitaire
d'exemple, un test de bout en bout d'exemple et trois helpers (session, réinitialisation,
dates). Les étapes du TP le remplissent progressivement.

## Installation (toujours depuis un disque local)

```bash
npm install
npx playwright install chromium
```

## Commandes

```bash
npm run test:unit      # tests unitaires node:test (tests/unitaires/)
npm run test:e2e       # tests Playwright (tests/e2e/) ; l'application est démarrée automatiquement
npm test               # les deux
npm run test:critique  # tests tagués @critique
npm run test:etendu    # tests tagués @etendu
npm run rapport        # ouvre le dernier rapport HTML
```

L'application école se trouve dans `../app/` et se lance aussi à la main : `node ../app/serveur.js`
(port 4200 ; `PORT=4300 npm test` déplace l'application et les tests).

## Structure

```
tests/unitaires/   *.test.js  — règles métier (oracles)
tests/e2e/         *.spec.js  — parcours dans le navigateur
tests/pages/       Page Objects
tests/utils/       auth.js (session), reset.js (réinitialisation), dates.js (dates relatives)
tests/donnees/     jeux de données JSON
scripts/           cartographier.js : instantané d'accessibilité d'une page (rôles, noms, id, data-testid)
ia/commun/         bibliothèque d'appel à un modèle (mock par défaut, anthropic, ollama) et lecture du rapport JSON
```

## Outils fournis

```bash
node scripts/cartographier.js /index.html                          # la page telle que Playwright la voit
node scripts/cartographier.js /mes-emprunts.html testeur@exemple.fr   # avec une session injectée
```

`ia/commun/ia.js` expose `demander({ systeme, utilisateur, json })` ; le fournisseur vient de la
variable `IA_FOURNISSEUR` (`mock` par défaut : aucun réseau, aucune clé). Le simulateur reconnaît
la tâche aux mots « Tâche : triage » et « Tâche : génération de demandes d'inscription » dans le
prompt système.
