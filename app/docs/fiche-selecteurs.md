# Fiche de sélecteurs — Meeple

Construite à partir de l'instantané d'accessibilité et du tableau d'éléments interactifs
produits par `node scripts/cartographier.js <page> [email]` (Playwright/Chromium réel), puis
vérifiée dans l'onglet Accessibility. Fragilité : **1** stable (rôle + nom accessible unique et
parlant) — **2** utilisable mais demande un peu de contexte — **3** fragile (aucun nom
accessible, ou nom dupliqué sans repère supplémentaire).

Repère retenu, par ordre de préférence : rôle + nom accessible > étiquette reliée par `label` >
`data-testid` > `id`.

## Catalogue (`/index.html`)

| Élément | Rôle | Nom accessible | Repère retenu | Fragilité |
|---|---|---|---|---|
| Recherche | `searchbox` | **aucun** | `#recherche` (id, faute de mieux) | 3 |
| Filtre joueurs | `combobox` | « Nombre de joueurs » | `getByRole('combobox', { name: 'Nombre de joueurs' })` | 1 |
| Filtre durée | `combobox` | « Durée maximale » | `getByRole('combobox', { name: 'Durée maximale' })` | 1 |
| Zone de message | `status` | — | `#message` (repère technique, pas un contrôle) | 1 |
| Lien vers une fiche | `link` | nom du jeu (ex. « Catan ») | `getByRole('link', { name: 'Catan' })` | 1 |
| Bouton Emprunter/Réserver d'une carte | `button` | « Emprunter » ou « Réserver », **dupliqué sur chaque carte** | `li.jeu[data-jeu-id="J1"]` puis `getByRole('button')` à l'intérieur (ou `data-testid="btn-emprunter"` scopé à la carte) | 2 |
| Lien « Connexion » (visiteur) | `link` | « Connexion » | `#lien-compte` ou `getByRole('link', { name: 'Connexion' })` | 1 |
| Bouton Réinitialiser (pied de page, sur toutes les pages) | `button` | « Réinitialiser les données » | `getByRole('button', { name: 'Réinitialiser les données' })` | 1 |

**Sans nom accessible** : le champ de recherche (`#recherche`) — la spécification n'associe
qu'un `<span class="libelle">Recherche</span>`, pas un `<label>`. Vérifié en console :
`document.getElementById('recherche').labels.length === 0` (contre `1` pour les deux `<select>`,
qui ont bien un `<label for>`).

## Fiche du jeu (`/jeu.html?id=J1`)

| Élément | Rôle | Nom accessible | Repère retenu | Fragilité |
|---|---|---|---|---|
| Bouton Emprunter | `button` (cadré `hidden` si non pertinent) | « Emprunter » | `data-testid="btn-emprunter"` (id identique, les deux marchent) | 1 |
| Bouton Réserver | `button` | « Réserver » | `data-testid="btn-reserver"` | 1 |
| Lien retour catalogue | `link` | « Retour au catalogue » | `getByRole('link', { name: 'Retour au catalogue' })` | 1 |
| Zone de message | `status` | — | `#message` | 1 |

Les deux boutons Emprunter/Réserver existent toujours dans le DOM (un des deux `hidden`) : un
test qui vérifie « le bouton n'existe pas » (cas de l'étape 5, aucun exemplaire libre côté
façade) doit tester la visibilité, pas la seule présence dans le DOM.

## Mes emprunts (`/mes-emprunts.html`, connecté)

| Élément | Rôle | Nom accessible | Repère retenu | Fragilité |
|---|---|---|---|---|
| Bouton Déconnexion | `button` | « Déconnexion » | `#btn-deconnexion` | 1 |
| Bouton Rendre (par ligne) | `button` | « Rendre », **dupliqué sur chaque ligne** | scoper par la ligne : `getByRole('row', { name: /Dixit/ }).getByRole('button', { name: 'Rendre' })` | 2 |
| Bouton Prolonger (par ligne) | `button` | « Prolonger », **dupliqué** | même scoping par ligne | 2 |
| Compteur d'emprunts | texte (`<p>`) | — | `#compteur` | 1 |
| Liste des réservations | `list` / `listitem` | — | `#reservations` | 1 |

Aucun `data-testid` sur les boutons Rendre/Prolonger eux-mêmes contrairement au Catalogue et à la
fiche du jeu (ils portent `data-testid="btn-rendre"` / `"btn-prolonger"`, mais ce testid est
répété sur toutes les lignes) : le nom de la ligne (nom du jeu) reste le repère le plus sûr.

## Connexion (`/connexion.html`)

| Élément | Rôle | Nom accessible | Repère retenu | Fragilité |
|---|---|---|---|---|
| Champ Email | `textbox` | « Email » | `getByLabel('Email')` | 1 |
| Champ Mot de passe | `textbox` | « Mot de passe » | `getByLabel('Mot de passe')` | 1 |
| Bouton Se connecter | `button` | « Se connecter » | `getByRole('button', { name: 'Se connecter' })` | 1 |
| Lien Créer un compte | `link` | « Créer un compte » | `#lien-inscription` | 1 |
| Message d'erreur | `alert` | — | `#message-erreur` | 1 |

Page la mieux étiquetée du lot : tous les champs ont un `<label for>` correct.

## Inscription (`/inscription.html`)

| Élément | Rôle | Nom accessible | Repère retenu | Fragilité |
|---|---|---|---|---|
| Champ Prénom | `textbox` | « Prénom » | `getByLabel('Prénom')` | 1 |
| Champ Email | `textbox` | « Email » | `getByLabel('Email')` | 1 |
| Champ Mot de passe | `textbox` | « Mot de passe » | `getByLabel('Mot de passe')` | 1 |
| Case Adhésion premium | `checkbox` | « Adhésion premium (21 jours d'emprunt, 3 jeux) » | `getByRole('checkbox', { name: /Adhésion premium/ })` | 1 |
| Bouton Créer mon compte | `button` | « Créer mon compte » | `getByRole('button', { name: 'Créer mon compte' })` | 1 |
| Liste d'erreurs | `alert` (`<ul>`) | — | `#erreurs` | 1 |

## Éléments sans nom accessible (toutes pages confondues)

- Champ de recherche du Catalogue (`#recherche`) — étiquette visuelle en `<span>`, jamais
  reliée par `<label for>` ni `aria-label`.

## Observations à comparer à la règle (à vérifier aux étapes suivantes)

1. **RG-CATALOGUE** — `chargerJeux({ joueurs: 8 })` renvoie une liste **vide**, alors que le
   README donne lui-même l'exemple « 8 joueurs → Codenames seul » (Codenames va jusqu'à 8
   joueurs). Le filtre applique `joueursMax > nombre` (strict) au lieu de `joueursMax >= nombre`.
   Le même défaut toucherait l'exemple « 4 joueurs → 8 jeux » (Catan, max 4, serait exclu).
2. **RG-PROLONGATION** — `prolonger('E1')` (Catan, emprunté par Camille, réservé par Inès selon
   le jeu de données initial) est **accepté**, alors que la règle impose un refus « jeu
   réservé » dès qu'un autre membre a une réservation en attente sur ce jeu.
3. **États de la page Catalogue** — en lisant `catalogue.js`, le message affiché en cas d'échec
   de chargement est « Erreur de chargement », alors que la spécification impose « Impossible
   de charger le catalogue. » (à confirmer à l'étape 6 avec `page.route`).
4. **RG-RETARD** (déjà confirmé à l'étape 1) — la pénalité n'est pas plafonnée à 10,00 EUR
   au-delà de 20 jours de retard.
5. **Accessibilité** — le champ de recherche du Catalogue n'a aucun nom accessible.
