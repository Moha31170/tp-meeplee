# TP de synthèse — Meeple : recette d'une ludothèque en ligne, jusqu'à vos agents OpenCode

Durée indicative : 8 heures, en deux demi-journées (étapes 0 à 7) puis une demi-journée
(étapes 8 à 11 et restitution). Travail individuel ou en binôme, restitution en fin de parcours.

## Mise en situation

Une association vous confie la recette de **Meeple**, sa nouvelle ludothèque en ligne : les
membres y empruntent des jeux de société, les prolongent, les rendent et réservent un jeu dont
tous les exemplaires sont sortis. Vous disposez de la spécification de référence (le `README.md`
de l'application), de l'application servie en local et d'un projet de tests de départ. Vous
livrez un dépôt de tests complet, des fiches d'anomalies prouvées, et vos propres agents
OpenCode pour continuer le travail après vous.

Aucune notion nouvelle jusqu'à l'étape 10 : le parcours mobilise, dans l'ordre, les oracles et
`node:test`, l'exploration du DOM et de la façade, Playwright, les fixtures et Page Objects,
`page.route`, l'horloge figée, axe-core, les captures, le budget de poids, le mobile, les tags,
l'assistant IA en conversation puis dans le code. L'étape 11 transforme ce que vous savez faire
en agents.

## Objectifs

- Traduire les règles métier de Meeple en oracles exécutables et en tests pilotés par les données
- Cartographier l'application dans le navigateur avant d'écrire un localisateur
- Écrire une suite de bout en bout complète, structurée, indépendante du jour d'exécution
- Couvrir les états simulés, l'accessibilité, l'apparence, le poids et le rendu mobile
- Organiser la suite : tags, instabilité traquée, README
- Utiliser l'IA à trois niveaux : en conversation, dans le code, en agents
- Documenter chaque anomalie avec une preuve

## Prérequis

- Node.js 20, npm, Chromium installé par Playwright, Visual Studio Code
- OpenCode installé (`opencode --version`) et un fournisseur configuré (`opencode auth login`),
  pour l'étape 11 uniquement
- Le dossier `projet-meeple/` copié sur un disque local (jamais sur un lecteur réseau) : `app/`
  et `tests/` côte à côte
- Vos supports des modules 1 à 8, à portée de main pour relire, pas pour coller

## Assistant IA : règles du jeu

Un assistant en conversation est autorisé dès l'étape 9, un agent à l'étape 11. Dans les
conditions d'une mission :

- **Autorisé** : générer un oracle, un tableau de cas, un test, un Page Object ; relire avec la
  grille en dix points ; expliquer un échec ; trier des échecs.
- **Chaque sortie est vérifiée** avant d'entrer dans le dépôt : un localisateur est contrôlé dans
  la page, un attendu est relu contre la spécification, une fiche d'anomalie est rejouée à la main.
- **Journal des générations** dans le README du dépôt : ce qui a été demandé, ce qui a été gardé,
  ce qui a été corrigé.
- **Aucune donnée réelle** dans un prompt. Meeple est fictive : sa spécification et le HTML de ses
  pages peuvent être fournis.

## Étape 0 — Mise en place (20 min)

1. Lancez l'application : `node app/serveur.js`, puis ouvrez `http://localhost:4200`. Le pied de
   page affiche « Meeple 1.0.0 ». Si le port est pris, `PORT=4300 node app/serveur.js` et la même
   variable devant toutes les commandes de test.
2. Dans `tests/` : `npm install` puis `npx playwright install chromium`.
3. `npm run test:unit` puis `npx playwright test` : un test unitaire et un test de bout en bout
   d'exemple passent.
4. Lisez `app/README.md` en entier, crayon en main : règles, comptes, jeux, messages, états.
   Notez les bornes de chaque règle.

Vous devriez obtenir `1 passed` deux fois, et une page de notes avec une dizaine de bornes.

## Déroulé et points de contrôle

| Étape | Durée | Modules mobilisés | À la fin, vous devez avoir |
|---|---|---|---|
| 1. Oracles | 45 min | 1, 2 | `npm run test:unit` exécuté, chaque rouge noté |
| 2. Explorer | 30 min | 3 | fiche de sélecteurs, script Node exécuté |
| 3. Premiers tests | 45 min | 4 | `01-connexion` vert, une trace ouverte |
| 4. Structurer | 30 min | 5 | fixtures, Page Objects, `02-catalogue` |
| 5. Règles métier | 60 min | 5, 6 | `03` à `06`, attendus calculés, horloge figée |
| 6. Réseau | 25 min | 5 | `07-etats` |
| 7. Au-delà du fonctionnel | 45 min | 5 | `08` à `11` |
| 8. Organiser | 30 min | 6 | tags, instabilité traquée, README |
| 9. IA en conversation | 30 min | 7 | un test généré, relu, journal |
| 10. IA dans le code | 40 min | 8 | données générées et validées, triage relu |
| 11. Agents OpenCode | 60 min | 7, 8 | agents listés, un test produit par l'agent, un refus observé |
| Restitution | 20 min | 9 | fiches d'anomalies, bilan, auto-évaluation |

Un point de contrôle manqué n'est pas un échec : réduisez le périmètre et notez-le dans le bilan.

## Étape 1 — Les oracles (45 min)

Modules 1 et 2. Dans `tests/utils/oracles.js`, écrivez **depuis la spécification** les fonctions
des règles RG-DUREE, RG-RETARD et RG-PROLONGATION : `dateRetourPrevue(dateEmprunt, premium)`,
`joursDeRetard(dateRetourPrevue, dateDuJour)`, `penalite(joursRetard)`,
`refusProlongation({ prolonge, joursRetard, reserveParUnAutre })`, plus `formaterEuros` et
`formaterDate`. Les dates sont des chaînes « AAAA-MM-JJ » ; calculez en UTC pour ignorer
l'heure.

1. Construisez un tableau de cas JSON par règle dans `tests/donnees/` : partitions et valeurs
   limites (jour du retour, premier jour de retard, le plafond exactement, juste au-dessus,
   changement de mois et d'année, année bissextile, ordre des vérifications d'une prolongation).
2. Écrivez `tests/unitaires/oracles.test.js` : un test par ligne du tableau, généré par une
   boucle. L'oracle doit d'abord être d'accord avec le tableau.
3. Confrontez ensuite l'application : `app/js/regles.js` exporte les mêmes fonctions. Dans
   `tests/unitaires/regles-application.test.js`, importez-les
   (`import * as application from '../../../app/js/regles.js'`) et comparez, cas par cas, à
   votre oracle.

Vous devriez obtenir `npm run test:unit` en moins d'une seconde, avec plusieurs dizaines de cas.
Notez chaque test rouge : valeur attendue, valeur observée, règle concernée. Ne corrigez jamais
l'oracle pour faire passer un test sans avoir relu la règle.

## Étape 2 — Explorer dans le navigateur (30 min)

Module 3. Application ouverte dans Chrome, outils de développement dépliés.

1. Console, page Catalogue : `document.querySelectorAll('li.jeu')`, puis un `console.table`
   avec le nom, la disponibilité et le bouton de chaque carte. Pour chaque champ de filtre,
   `labels.length`.
2. Console, la façade `window.meeple` : `chargerJeux({ joueurs: 8 })`, `chargerJeux({ joueurs: 2 })`,
   `connexion('testeur@exemple.fr', 'Test1234!')`, `mesEmprunts()`, `emprunter('J5')`,
   `prolonger('E1')`, `reinitialiser()`. Comparez chaque réponse à la spécification, écrivez ce
   que vous observez.
3. Depuis Node.js : `scripts/jeux-disponibles.js` lit `donnees/jeux.json` par `fetch` et affiche
   les jeux empruntables en tableau.
4. La fiche de sélecteurs, `docs/fiche-selecteurs.md` : pour chaque page, chaque élément
   interactif, son rôle et son nom accessible, le repère retenu, sa fragilité de 1 à 3. Le
   script fourni `node scripts/cartographier.js <url> [email]` vous montre la page telle que
   Playwright la voit : servez-vous-en, puis vérifiez dans l'onglet Accessibility.
5. Onglets Network et Application : quels fichiers JSON partent, quelles clés `localStorage`
   changent après une connexion, un emprunt, une réinitialisation.

Vous devriez obtenir une fiche à cinq pages, la liste des éléments sans nom accessible, et
trois ou quatre observations « à comparer à la règle » qui serviront aux étapes suivantes.

## Étape 3 — Premiers tests de bout en bout (45 min)

Module 4. Dans `tests/e2e/01-connexion.spec.js`, avec `@playwright/test` et les helpers
`connecter` et `reinitialiser` :

1. Camille se connecte par le formulaire et arrive sur Mes emprunts : adresse et compteur.
2. Un email inconnu, puis un mauvais mot de passe : message exact de la spécification, champ
   vidé, adresse inchangée.
3. Un visiteur qui clique sur « Réserver » depuis une fiche est renvoyé vers la connexion, puis
   revient sur la fiche.
4. La déconnexion renvoie au catalogue.

Puis : cassez volontairement un attendu, exécutez avec `--trace on`, lisez le message de haut en
bas (Expected, Received, Call log, chevron), ouvrez la trace puis le rapport HTML, corrigez.
Enfin, enregistrez un parcours avec `npx playwright codegen` et nettoyez-le : adresse relative,
localisateurs sémantiques, assertions, titre. Essayez `getByRole('button', { name: 'Emprunter' })`
sur le catalogue et lisez ce que Playwright vous répond.

Vous devriez obtenir `npx playwright test 01-connexion` vert, une trace ouverte une fois, et une
phrase dans vos notes sur le mode strict.

## Étape 4 — Structurer (30 min)

Module 5, séquence 1. Dans `tests/utils/fixtures.js`, étendez `test` avec une option `email`,
une fixture `membreConnecte` (réinitialise puis connecte) et une fixture `pageCatalogue`. Écrivez
un Page Object par page dans `tests/pages/` : `PageCatalogue`, `PageJeu`, `PageMesEmprunts`,
`PageConnexion`, `PageInscription`. Un Page Object expose des localisateurs et des actions, jamais
d'assertion. Réécrivez `01-connexion` avec eux, puis écrivez `02-catalogue.spec.js` : tri, jeu
retiré, disponibilités, filtres « 2 », « 4 » et « 8 » joueurs, durée maximale, cumul, recherche
insensible à la casse et aux accents, recherche sans résultat.

Vous devriez obtenir des tests exécutables un par un et dans n'importe quel ordre. Un rouge sur un
filtre se lit comme à l'étape 1 : Expected, Received, règle.

## Étape 5 — Les règles métier de bout en bout (60 min)

Modules 5 et 6. Quatre fichiers, les attendus calculés par vos oracles, jamais recopiés de
l'écran :

- `03-emprunt.spec.js` : quota atteint, emprunt d'un membre premium avec la date de retour
  calculée, disponibilité décomptée, compteur du membre premium, fiche d'un jeu (date de retour
  d'un visiteur, puis d'un membre premium), jeu déjà emprunté, aucun exemplaire libre (par la
  façade avec `page.evaluate`, le bouton n'existe pas).
- `04-retour-prolongation.spec.js` : rendre Dixit en retard (lisez la date de retour affichée,
  reconvertissez-la, calculez la pénalité), prolongation refusée d'un emprunt en retard,
  prolongation refusée d'un jeu réservé par un autre membre, prolongation acceptée puis refusée
  la seconde fois. Puis avec `page.clock.setFixedTime` avant `reinitialiser` : rendu le jour du
  retour prévu, et retard de plus de vingt jours.
- `05-reservation.spec.js` : position dans la file, annulation, refus quand un exemplaire est
  libre ou quand le jeu est déjà réservé, plafond des réservations.
- `06-inscription.spec.js` : champs obligatoires, mots de passe de 7 caractères et sans chiffre,
  email existant dans une autre casse, compte créé puis connexion.

Vous devriez obtenir une trentaine de tests, en moins de trente secondes, sans `waitForTimeout`.
Chaque rouge est classé : défaut du test, anomalie de l'application, environnement, instable.

## Étape 6 — Maîtriser le réseau (25 min)

Module 5, séquence 2. `07-etats.spec.js` avec `page.route` sur `**/donnees/jeux.json` : liste
vide, réponse 500, réponse lente de 1,5 s. Pour chaque état, le texte exact de la spécification
et l'élément qui le porte.

Vous devriez obtenir trois tests, dont un qui vérifie que le message de chargement apparaît puis
disparaît.

## Étape 7 — Au-delà du fonctionnel (45 min)

Module 5, séquence 3.

- `08-accessibilite.spec.js` : axe-core, règles WCAG 2 A et AA, sur les cinq pages, dont une
  page connectée par la fixture. Rapportez chaque violation dans la console et en pièce jointe,
  puis bloquez sur la liste des identifiants.
- `09-visuel.spec.js` : capture de référence de la page Connexion, puis de Mes emprunts avec les
  colonnes de dates masquées. Exécutez deux fois et lisez la première sortie.
- `10-poids.spec.js` : mesurez d'abord (nombre de réponses, octets reçus, `loadEventEnd`), puis
  fixez un budget arrondi au-dessus.
- `11-mobile.spec.js` : ajoutez un projet `mobile` (Pixel 7) dans la configuration, réservé à ce
  fichier ; vérifiez l'absence de défilement horizontal, le bord droit de chaque carte, la taille
  de police du nom d'un jeu. `expect.soft` permet de voir tous les écarts d'un coup.

Vous devriez obtenir un premier passage rouge puis vert pour le visuel, une mesure de poids
affichée, et `npx playwright test --project=mobile` qui ne joue que le fichier mobile.

## Étape 8 — Organiser (30 min)

Module 6, sans le pipeline. Taguez chaque test `@critique` ou `@etendu`, vérifiez les scripts
`test:critique` et `test:etendu`. Ajoutez `tests/utils/reseau.js` avec `simulerLatence` et
traquez une instabilité sur un fichier avec `--repeat-each 10`. Remplacez une lecture directe
par `expect.poll` ou `toPass` là où une valeur est calculée. Écrivez le README du dépôt :
installation, commandes, tags, conventions, variables (`PORT`, `CI`).

Vous devriez obtenir deux sous-ensembles qui s'exécutent séparément, une suite complète en moins
de deux minutes, un README qu'un collègue peut suivre.

## Étape 9 — L'assistant IA en conversation (30 min)

Module 7. Ouvrez la section « Assistant IA » du README, puis, avec le gabarit R.C.T.F.C et la
sortie de `scripts/cartographier.js` sur la page concernée :

1. Faites générer `12-fiche-jeu.spec.js` : caractéristiques d'un jeu, jeu retiré, identifiant
   inconnu. Vérifiez chaque localisateur dans la page, chaque message dans la spécification.
2. Faites relire un de vos fichiers avec la grille en dix points ; appliquez ce qui est juste.
3. Faites expliquer un de vos rouges en collant la sortie de Playwright.

Vous devriez obtenir un test généré, corrigé et exécuté, et trois entrées dans le journal.

## Étape 10 — L'IA dans le code (40 min)

Module 8. La bibliothèque `ia/commun/` est fournie : `demander()` avec un fournisseur simulé par
défaut, sans réseau ni clé. Le simulateur reconnaît la tâche aux mots « Tâche : génération de
demandes d'inscription » et « Tâche : triage » du prompt système, et attend les règles sous la
forme de lignes « - RG-XXX : … » et « - Page X : /url ».

1. `ia/commun/validation-membres.js` : l'oracle RG-INSCRIPTION appliqué à une liste de demandes
   (champs, mot de passe, email unique sans distinction de casse, y compris entre deux demandes
   de la liste), plus les exigences de couverture (chaque verdict présent, bornes de 7 et 8
   caractères, email existant dans une autre casse).
2. `ia/scripts/generer-membres.js` : prompt, appel JSON, validation, régénération bornée avec
   les erreurs, artefact `tests/donnees/inscriptions-generees.json`.
3. `13-inscription-generee.spec.js` : chaque demande rejouée dans le navigateur doit produire
   le verdict attendu.
4. `ia/commun/regles-meeple.js` (extrait de la spécification), `ia/scripts/triage-ia.js` :
   `npm run test:e2e:json`, lecture du rapport, un appel par échec, contrôle de la réponse,
   fiches Markdown « à relire », tableau final, `bilan-ia.js`.
5. Relecture humaine : pour chaque fiche, décidez, datez, signez.

Vous devriez obtenir une génération qui converge en deux tentatives avec le simulateur, un
rapport JSON, autant de fiches que d'échecs classés « anomalie probable », et un bilan à coût nul.

## Étape 11 — Vos agents OpenCode (60 min)

Modules 7 et 8, en mode agent. Dans le dossier `tests/` :

1. `AGENTS.md` : les règles que tout agent doit lire. Structure du projet, commandes, comptes et
   jeu de données, cycle obligatoire (cartographier, spécifier, écrire, exécuter, lire l'échec),
   conventions de localisateurs et d'assertions, interdits (ne jamais modifier `../app/`, ne
   jamais affaiblir une assertion, ne jamais dire qu'un test passe sans l'avoir exécuté), grille
   en dix points, format de fiche, bilan de fin de tâche.
2. `opencode.json` : modèle par défaut, `instructions` pointant sur `../app/README.md`,
   permissions : tests autorisés, écriture sur confirmation, `rm` et `git push` refusés, le reste
   sur confirmation.
3. `.opencode/agents/testeur-meeple.md` : agent principal. Description, mode, permissions, puis le
   prompt : sources de vérité dans l'ordre, méthode en six points, interdits.
4. `.opencode/agents/relecteur-tests.md` : sous-agent en lecture seule qui applique la grille.
5. `.opencode/commands/` : `/cartographier`, `/generer-test`, `/relire`. Un fichier Markdown par
   commande, avec `$ARGUMENTS`, un `!` pour injecter la liste des fichiers de tests, un `@` pour
   joindre un helper.
6. `opencode agent list` doit lister vos agents.
7. Utilisation : `/cartographier /mes-emprunts.html premium@exemple.fr`, puis `/generer-test`
   sur une règle non encore couverte, par exemple la réservation de 7 Wonders par Camille puis son
   annulation. Lisez chaque action avant de l'accepter. Puis `/relire` sur le fichier produit.
8. Faites-lui demander de corriger l'application dans `../app/` : il doit refuser et proposer
   une fiche. Notez ce qu'il répond.
9. Facultatif : un sous-agent `analyste-echecs` et une commande `/trier-echecs` qui rejoue la
   suite et classe les rouges.

Vous devriez obtenir `opencode agent list` avec deux ou trois agents à vous, un test généré par
l'agent, exécuté et relu, un refus observé, et le journal du README complété.

## Restitution (20 min)

- `docs/anomalies.md` : une fiche par anomalie, format MEE-NN (Résumé, Page, Pré-conditions,
  Étapes, Observé, Attendu et règle, Preuve, Sévérité). Une anomalie révélée par plusieurs tests
  ne fait qu'une fiche.
- `docs/bilan.md` : périmètre, couverture par règle, résultats chiffrés, anomalies par sévérité,
  ce que vous feriez ensuite.
- Trois minutes à l'oral : périmètre, couverture, anomalies majeures, suite.
- Grille d'auto-évaluation.

## Structure attendue du dépôt

```
tests/
  package.json, playwright.config.js, README.md, AGENTS.md, opencode.json
  .opencode/agents/, .opencode/commands/
  scripts/cartographier.js, scripts/jeux-disponibles.js
  tests/utils/    oracles.js, fixtures.js, auth.js, reset.js, dates.js, reseau.js
  tests/donnees/  cas-*.json, inscriptions-generees.json
  tests/unitaires/  oracles.test.js, regles-application.test.js
  tests/pages/    PageCatalogue.js, PageJeu.js, PageMesEmprunts.js, PageConnexion.js, PageInscription.js
  tests/e2e/      01 à 14, tagués
  ia/commun/      ia.js (fourni), fournisseurs/ (fourni), rapport-playwright.js (fourni), regles-meeple.js, validation-membres.js
  ia/scripts/     generer-membres.js, triage-ia.js, bilan-ia.js
  docs/           fiche-selecteurs.md, anomalies.md, anomalies-ia/, bilan.md
```

## Dépannage

- **Le port 4200 est occupé** : `PORT=4300` devant `node app/serveur.js` et devant chaque commande
  de test ; la configuration et le serveur lisent la même variable.
- **Un test passe seul et échoue dans la suite** : état partagé ; chaque test repart d'un
  contexte neuf et réinitialise lui-même ses données.
- **`connecter` ne connecte pas** : `reinitialiser` efface la session ; appelez `connecter` après.
- **Un attendu de date casse le lendemain** : lisez la date affichée et recalculez, ou figez
  l'horloge avec `page.clock.setFixedTime` avant le premier `goto`.
- **`toHaveScreenshot` rouge à la première exécution** : la référence vient d'être créée ;
  relancez, relisez l'image, versionnez-la.
- **Le fichier mobile ne s'exécute pas** : il doit être exclu du projet `chromium` (`testIgnore`)
  et inclus dans le projet `mobile` (`testMatch`).
- **Le simulateur répond « Réponse simulée… »** : le prompt système ne contient pas la phrase
  de tâche attendue.
- **`opencode agent list` n'affiche pas vos agents** : dossier `.opencode/agents/` dans `tests/`,
  extension `.md`, champ `description` obligatoire dans l'en-tête, commande lancée depuis `tests/`.


## Pour aller plus loin

- Ajoutez un projet Firefox et rejouez le sous-ensemble `@critique`.
- Faites produire les captures de référence dans l'image Playwright officielle, en conteneur.
- Branchez un fournisseur réel (`IA_FOURNISSEUR=anthropic`, clé dans l'environnement,
  `IA_MAX_APPELS=10`) et comparez ses fiches à celles du simulateur.
- Donnez à votre agent une commande `/campagne` qui enchaîne tests unitaires, tests critiques et
  bilan, et lisez ce qu'il propose quand un rouge apparaît.
