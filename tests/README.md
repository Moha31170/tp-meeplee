# qa-front-meeple — tests de l'application école Meeple

Projet de tests de l'application Meeple avec Playwright et `node:test`.
L'application est démarrée automatiquement par Playwright ; aucun pipeline CI/CD n'est requis
pour ce module.

## Installation

Depuis le dossier `tests/` :

```bash
npm install
npx playwright install chromium
```

L'application se trouve dans `../app/` et Playwright la démarre automatiquement sur le port 4200.

## Commandes

### Tests unitaires

```bash
npm run test:unit
```

### Tests E2E

```bash
npm run test:e2e
```

### Suite complète

```bash
npm test
```

La suite complète doit rester sous deux minutes sur une machine de développement standard.

### Sous-ensemble critique

```bash
npm run test:critique
```

Équivalent à :

```bash
npx playwright test --grep "@critique"
```

### Sous-ensemble étendu

```bash
npm run test:etendu
```

Équivalent à :

```bash
npx playwright test --grep "@etendu"
```

Les deux sélections sont exclusives : chaque test E2E porte exactement un des deux tags.

### Projet mobile

```bash
npx playwright test --project=mobile
```

Ce projet utilise le profil Playwright `Pixel 7` et est réservé à `11-mobile.spec.js`.

## Tags

Les tests E2E sont classés selon leur criticité :

- `@critique` : parcours métier essentiels à la validation de l'application.
- `@etendu` : scénarios complémentaires, contrôles non fonctionnels et vérifications approfondies.

Le tag est placé dans les options du test :

```js
test("connexion réussie", { tag: "@critique" }, async ({ page }) => {
  // ...
});
```

## Instabilité et répétition

Pour rechercher une instabilité sur un fichier :

```bash
npx playwright test tests/e2e/07-etats.spec.js --repeat-each 10
```

Pour faciliter le diagnostic en supprimant la concurrence :

```bash
npx playwright test tests/e2e/07-etats.spec.js --repeat-each 10 --workers=1
```

Une exécution répétée ne constitue pas une preuve qu'un test est flaky : il faut comparer les
résultats des dix répétitions et conserver la sortie Playwright en cas d'écart.

## Latence réseau

`tests/utils/reseau.js` fournit :

```js
simulerLatence(page, ms, urlPattern);
```

Par défaut, les requêtes sous `/donnees/` sont ralenties. Un motif précis peut être fourni :

```js
await simulerLatence(page, 1500, "**/donnees/jeux.json");
```

Le helper attend avant de laisser passer la requête et ne modifie pas l'application elle-même.

## Attentes asynchrones

Lorsqu'une valeur est calculée ou rendue après une opération asynchrone, ne pas effectuer une
lecture immédiate suivie d'une assertion fragile. Utiliser une attente Playwright comme
`expect.poll` ou `toPass`.

Exemple :

```js
await expect(async () => {
  const valeur = await locator.textContent();
  expect(valeur).toMatch(/.../);
}).toPass();
```

## Variables d'environnement

### `PORT`

Définit le port HTTP utilisé par l'application et par Playwright.

Windows PowerShell :

```powershell
$env:PORT=4300
npm run test:e2e
```

Linux/macOS :

```bash
PORT=4300 npm run test:e2e
```

La valeur par défaut est `4200`.

### `CI`

`CI` permet de signaler une exécution d'intégration continue à la configuration Playwright.
Dans ce projet, lorsqu'elle est définie, la configuration utilise davantage de workers, active
une reprise (`retry`) et interdit les `test.only` oubliés.

Windows PowerShell :

```powershell
$env:CI=1
npm run test:e2e
```

Linux/macOS :

```bash
CI=1 npm run test:e2e
```

**Ce module ne demande pas de créer ou configurer un pipeline CI/CD.** La variable `CI` est
simplement prise en charge par la configuration locale afin que son comportement soit explicite.

## Conventions

- Tests E2E : `tests/e2e/*.spec.js`.
- Tests unitaires : `tests/unitaires/*.test.js`.
- Page Objects : `tests/pages/`.
- Helpers : `tests/utils/`.
- Données de test : `tests/donnees/`.
- Un fichier `.spec.js` correspond à une fonctionnalité ou un thème de test.
- Chaque test E2E porte exactement un tag `@critique` ou `@etendu`.
- Préférer les localisateurs accessibles (`getByRole`, `getByLabel`, etc.) aux sélecteurs CSS
  lorsque cela est possible.
- Préférer les assertions Playwright avec attente automatique (`toHaveText`, `toBeVisible`,
  `toHaveURL`, `expect.poll`, `toPass`) aux temporisations arbitraires.
- Les tests doivent être indépendants : réinitialiser les données et préparer la session
  nécessaires avant chaque scénario.
- Ne pas modifier `../app/` pour faire passer un test.

## Structure utile

```text
tests/
├── package.json
├── playwright.config.js
├── README.md
├── scripts/
├── tests/
│   ├── donnees/
│   ├── e2e/
│   ├── pages/
│   ├── unitaires/
│   └── utils/
│       ├── auth.js
│       ├── dates.js
│       ├── fixture.js
│       ├── oracles.js
│       ├── reseau.js
│       └── reset.js
└── ia/
    └── commun/
```

## Rapport Playwright

Après une exécution :

```bash
npm run rapport
```

ouvre le dernier rapport HTML.

## Journal des générations IA — module 7

| Entrée                              | Demande                                                                                                                                                                           | Gardé                                                                                                                                                       | Corrigé                                                                                                                                                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-18 — génération             | Générer `12-fiche-jeu.spec.js` avec R.C.T.F.C pour la fiche d'un jeu, un jeu retiré et un identifiant inconnu, à partir de la spécification et de la cartographie de `/jeu.html`. | Trois scénarios indépendants, tag `@etendu`, Page Object `PageJeu`, assertions exactes sur les caractéristiques et messages.                                | Ajout des localisateurs de la fiche (`#joueurs`, `#duree`, `#age`, `#categorie`, `#fiche`, `#chargement`) dans `PageJeu` après vérification dans `jeu.html`.                                                          |
| 2026-09-18 — relecture              | Relire `12-fiche-jeu.spec.js` avec la grille en dix points.                                                                                                                       | Indépendance des tests, données de référence explicites, attentes Playwright, absence de temporisation arbitraire, tag et organisation conformes au README. | Remplacement des sélecteurs d'actions potentiellement fragiles par `getByRole`, calcul de la date de retour avec les helpers existants, vérification explicite des états cachés/visibles et des messages exacts.      |
| 2026-09-18 — explication d'un rouge | Expliquer le rouge de `07-etats.spec.js` après exécution Playwright.                                                                                                              | Le test exprime correctement l'attendu de la spécification pour HTTP 500 : `Impossible de charger le catalogue.`.                                           | Le rouge est interprété comme une anomalie probable de l'application : attendu `Impossible de charger le catalogue.`, observé `Erreur de chargement`. Le test n'est pas affaibli et l'application n'est pas modifiée. |
