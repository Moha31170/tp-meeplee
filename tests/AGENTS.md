# Règles Communes des Agents (Projet Meeple)

## Structure du Projet

- `../app/` : Code source de l'application (Lecture seule stricte).
- `./` (tests/) : Répertoire de travail pour les tests e2e, unitaires et les scripts IA.

## Cycle Obligatoire

1. **Cartographier** : Analyser le DOM et les sélecteurs de la page cible.
2. **Spécifier** : Définir les cas de test avant de coder.
3. **Écrire** : Rédiger le script Playwright.
4. **Exécuter** : Lancer le test systématiquement.
5. **Lire l'échec** : Analyser le rapport et corriger si nécessaire.

## Conventions

- **Localisateurs** : Privilégier les rôles ARIA, les textes (`getByText`, `getByRole`) et les attributs de données (`data-testid`).
- **Assertions** : Utiliser les web-first assertions de Playwright (`expect(locator).toBeVisible()`).
- **Comptes & Données** : Utiliser les données de `app/donnees/membres.json`.

## INTERDITS ABSOLUS

- **NE JAMAIS** modifier le contenu du dossier `../app/`.
- **NE JAMAIS** affaiblir une assertion pour forcer un test à passer au vert.
- **NE JAMAIS** déclarer qu'un test passe sans en avoir fourni la preuve d'exécution.

## Grille de Relecture (10 points)

1. Le test est-il indépendant ?
2. Les localisateurs sont-ils résilients ?
3. Les assertions valident-elles le comportement métier (et pas juste le DOM) ?
4. Le nettoyage (teardown) est-il assuré ?
5. Les temps d'attente implicites de Playwright sont-ils respectés (pas de `waitForTimeout` arbitraire) ?
6. Les données de test sont-elles mockées ou prévisibles ?
7. Le nommage du test est-il clair et descriptif ?
8. Les cas d'erreur sont-ils testés ?
9. L'accessibilité de base est-elle respectée dans le parcours ?
10. Le test couvre-t-il la spécification demandée ?

## Format de Fiche de Bug

```text
**Titre** : [Page] Description courte
**Étapes pour reproduire** :
1. ...
**Résultat attendu** : ...
**Résultat obtenu** : ...
**Sélecteur/Erreur** : ...
```

## Bilan de fin de tâche

À la fin de chaque tâche, générer un court résumé des actions effectuées, des tests passés et des fiches créées.
