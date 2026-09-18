# Projet de synthèse Meeple — ludothèque en ligne

Second projet complet de la formation, indépendant de Réunio : une application école à tester,
un projet de tests de départ, un TP guidé qui couvre les modules 1 à 8 (sans React, Vue ni
intégration continue) et se termine par la création d'agents OpenCode, un corrigé complet
exécuté, et le catalogue des défauts implantés.

Usage recommandé : journée d'entraînement ou d'évaluation après le module 8, travail hors
séance, ou terrain de rattrapage pour un apprenant qui a décroché sur Réunio.

## Contenu

| Dossier ou fichier | Contenu | Destinataire |
|---|---|---|
| `app/` | l'application Meeple : HTML, CSS, modules ES, serveur statique sans dépendance (port 4200), `README.md` = spécification de référence | Apprenants et formateur |
| `tests/` | projet de tests de départ : configuration Playwright, helpers, exemples, script de cartographie, bibliothèque IA (`ia/commun/`) | Apprenants |
| `TP.md` | le TP guidé, 11 étapes et restitution, grille d'auto-évaluation | Apprenants |
| `DEFAUTS.md` | les huit défauts implantés, localisation, reproduction, vérification par exécution | Formateur uniquement |
| `solutions/TP-solution.md` | corrigé étape par étape avec les sorties réelles | Formateur uniquement |
| `solutions/code/` | la suite complète (56 tests de bout en bout, 42 unitaires), l'outillage IA, les agents OpenCode, les fiches produites | Formateur uniquement |

## Lancer

```bash
cp -r projet-meeple /tmp/meeple && cd /tmp/meeple      # toujours depuis un disque local
node app/serveur.js                                     # http://localhost:4200
cd tests && npm install && npx playwright install chromium
npm run test:unit && npx playwright test                # 1 passed, 1 passed
```

Comptes : `testeur@exemple.fr` (Camille, standard), `premium@exemple.fr` (Karim, premium),
`standard@exemple.fr` (Inès, standard), mot de passe `Test1234!`. L'état vit dans le
`localStorage` ; « Réinitialiser les données » remet le jeu initial, dont les dates sont
relatives au jour.

## Ce que couvre le TP, module par module

| Module | Étape du TP |
|---|---|
| 1 et 2 — JavaScript, oracles, `node:test` | 1 |
| 3 — DOM, façade, fiche de sélecteurs, `fetch` | 2 |
| 4 — Playwright, lecture d'un échec, codegen | 3 |
| 5 — fixtures, Page Objects, `page.route`, axe-core, visuel, poids, mobile | 4, 5, 6, 7 |
| 6 — dates et horloge, tags, instabilité, README (sans pipeline) | 5, 8 |
| 7 — assistant en conversation, R.C.T.F.C, grille | 9 |
| 8 — IA dans le code : données générées, triage | 10 |
| 7 et 8 en mode agent — OpenCode | 11 |
