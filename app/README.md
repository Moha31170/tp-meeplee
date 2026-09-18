# Meeple — ludothèque en ligne (application école)

Meeple permet aux membres d'une ludothèque associative d'emprunter des jeux de société en
ligne, de les prolonger, de les rendre et de réserver un jeu dont tous les exemplaires sont
sortis. Ce document est la **spécification de référence** de l'application : tout comportement
observé qui s'en écarte est une anomalie.

Application front-end statique : HTML, CSS et JavaScript (modules ES). Aucune installation,
aucun serveur applicatif. Les données de référence (jeux, comptes de démonstration) sont des
fichiers JSON ; l'état modifiable (session, emprunts, réservations, comptes créés) est conservé
dans le `localStorage` du navigateur. La date du jour est celle de l'horloge du navigateur, en
date de Paris.

## Lancement

```bash
node serveur.js          # ou : PORT=4300 node serveur.js
```

Puis ouvrir `http://localhost:4200`. Le bouton « Réinitialiser les données » du pied de page
remet le jeu de données initial (session comprise).

## Comptes de démonstration (mot de passe commun `Test1234!`)

| Email | Prénom | Adhésion | Emprunts au démarrage | Réservations au démarrage |
|---|---|---|---|---|
| `testeur@exemple.fr` | Camille | standard | Catan (emprunté il y a 10 jours, retour dans 4 jours), Dixit (emprunté il y a 20 jours, retour prévu il y a 6 jours : en retard) | aucune |
| `premium@exemple.fr` | Karim | premium | 7 Wonders (emprunté il y a 5 jours, retour dans 16 jours) | aucune |
| `standard@exemple.fr` | Inès | standard | Azul (emprunté il y a 3 jours, retour dans 11 jours) | Catan (position 1, déposée il y a 2 jours) |

Toutes les dates du jeu de données sont calculées par rapport à la date du jour.

## Jeux

| Id | Nom | Joueurs | Durée | Âge | Catégorie | Exemplaires | Statut |
|---|---|---|---|---|---|---|---|
| J1 | Catan | 3 à 4 | 90 min | 10+ | stratégie | 1 | disponible (0 exemplaire libre : emprunté par Camille) |
| J2 | Dixit | 3 à 6 | 30 min | 8+ | ambiance | 2 | disponible (1 exemplaire libre) |
| J3 | 7 Wonders | 2 à 7 | 30 min | 10+ | stratégie | 1 | disponible (0 exemplaire libre : emprunté par Karim) |
| J4 | Azul | 2 à 4 | 40 min | 8+ | abstrait | 2 | disponible (1 exemplaire libre) |
| J5 | Codenames | 2 à 8 | 15 min | 14+ | ambiance | 3 | disponible (3 exemplaires libres) |
| J6 | Pandemic | 2 à 4 | 45 min | 8+ | coopératif | 1 | disponible (1 exemplaire libre) |
| J7 | Les Aventuriers du Rail | 2 à 5 | 60 min | 8+ | famille | 1 | disponible (1 exemplaire libre) |
| J8 | Twilight Imperium | 3 à 6 | 480 min | 14+ | stratégie | 1 | retiré (en réparation) |

## Pages

| Page | Rôle |
|---|---|
| `/index.html` | Catalogue : liste des jeux, recherche par nom, filtres « Nombre de joueurs » et « Durée maximale », bouton « Emprunter » (ou « Réserver » quand aucun exemplaire n'est libre ; désactivé pour un jeu retiré) |
| `/jeu.html?id=J1` | Fiche du jeu : détails, disponibilité, date de retour prévue si l'emprunt a lieu aujourd'hui, boutons « Emprunter » ou « Réserver » |
| `/mes-emprunts.html` | Mes emprunts : compteur d'emprunts en cours, tableau des emprunts avec « Rendre » et « Prolonger », liste des réservations avec « Annuler » ; connexion requise |
| `/connexion.html` | Connexion par email et mot de passe |
| `/inscription.html` | Création de compte |

Une action qui exige une session (Emprunter, Réserver, Mes emprunts) redirige un visiteur non
connecté vers `/connexion.html?retour=<page>` ; après connexion, il revient sur la page demandée.

## Règles métier

### RG-DUREE — durée d'un emprunt

- Adhésion standard : 14 jours. Adhésion premium : 21 jours.
- Date de retour prévue = date d'emprunt + durée. Un jeu rendu le jour du retour prévu n'est
  pas en retard.
- Les dates s'affichent au format « JJ/MM/AAAA ».

Exemples : emprunt le 01/03/2027 → retour le 15/03/2027 (standard), le 22/03/2027 (premium).

### RG-QUOTA — nombre d'emprunts et de réservations

- Au plus 2 emprunts en cours par membre standard, 3 par membre premium, sinon
  « Vous avez déjà N emprunts en cours. » (N = quota du membre).
- Un membre n'emprunte pas deux fois le même jeu : « Vous avez déjà ce jeu. »
- Au plus 2 réservations en attente par membre, sinon « Vous avez déjà 2 réservations en
  attente. »
- Le compteur de la page Mes emprunts affiche « N emprunt(s) en cours sur Q », Q étant le
  quota du membre (2 ou 3).

### RG-RETARD — pénalités

- 0,50 EUR par jour de retard, **plafonnés à 10,00 EUR** par emprunt.
- Le retard se compte en jours calendaires après la date de retour prévue : 0 le jour même.
- La pénalité est calculée au moment du retour et affichée dans le tableau des emprunts, en
  estimation tant que le jeu n'est pas rendu.

Exemples : 6 jours de retard → 3,00 EUR ; 20 jours → 10,00 EUR ; 25 jours → 10,00 EUR.

### RG-PROLONGATION — prolongation

- Une seule prolongation par emprunt, de 7 jours à partir de la date de retour prévue.
- Refusée si l'emprunt est en retard, s'il a déjà été prolongé, ou si un **autre** membre a
  une réservation en attente sur ce jeu. Messages, dans cet ordre de vérification :
  « Prolongation impossible : déjà prolongé. », « Prolongation impossible : emprunt en retard. »,
  « Prolongation impossible : jeu réservé. »
- Acceptée : « Prolongation acceptée : nouveau retour le JJ/MM/AAAA. »

### RG-EMPRUNT — conditions d'un emprunt

Vérifications, dans cet ordre : 1) le jeu n'est pas retiré (« Jeu indisponible. ») ;
2) le membre ne l'a pas déjà (« Vous avez déjà ce jeu. ») ; 3) le quota n'est pas atteint
(RG-QUOTA) ; 4) au moins un exemplaire est libre (« Aucun exemplaire disponible :
réservez-le. »). Emprunt accepté : « Emprunt confirmé : <jeu>, à rendre le JJ/MM/AAAA. »
Un exemplaire est libre quand le nombre d'emprunts en cours du jeu est inférieur au nombre
d'exemplaires. Une réservation en attente du membre sur ce jeu est alors satisfaite.

### RG-RESERVATION — réservation

- Possible uniquement quand aucun exemplaire n'est libre (« Un exemplaire est disponible :
  empruntez-le. » sinon), sur un jeu non retiré, que le membre n'a pas déjà emprunté ni déjà
  réservé (« Vous avez déjà réservé ce jeu. »), dans la limite de RG-QUOTA.
- Position dans la file = rang parmi les réservations en attente du jeu, par date de dépôt.
  Message : « Réservation enregistrée : <jeu>, position N. »
- Annulation à tout moment : « Réservation annulée. »

### RG-RETOUR — retour d'un jeu

- Sans retard : « Jeu rendu, merci ! »
- Avec retard : « Jeu rendu avec N jour(s) de retard : pénalité de X EUR. » (X au format
  « 3,00 EUR »). Le tableau affiche ensuite « Rendu le JJ/MM/AAAA » et la pénalité.

### RG-CATALOGUE — recherche et filtres

- Recherche par nom : sous-chaîne, insensible à la casse et aux accents.
- « Nombre de joueurs » N : jeux jouables à N (joueurs minimum ≤ N ≤ joueurs maximum).
- « Durée maximale » D : jeux dont la durée est inférieure ou égale à D.
- Les filtres se cumulent ; la liste est triée par nom.

Exemples : « 4 » joueurs → 8 jeux ; « 8 » joueurs → Codenames seul ; « 2 » joueurs → 5 jeux ;
durée « 30 min » → 7 Wonders, Codenames, Dixit.

### RG-INSCRIPTION — création de compte

- Prénom, email et mot de passe obligatoires (l'adhésion premium est facultative).
- Mot de passe d'au moins 8 caractères contenant au moins un chiffre.
- Email unique (comparaison insensible à la casse).

### États de la page Catalogue

- « Chargement du catalogue… » pendant le chargement.
- « Impossible de charger le catalogue. » si le chargement échoue.
- « Aucun jeu ne correspond. » si aucun résultat.

## Messages de l'application

| Situation | Message |
|---|---|
| Connexion refusée | « Identifiants invalides. » |
| Emprunt confirmé | « Emprunt confirmé : <jeu>, à rendre le JJ/MM/AAAA. » |
| Quota atteint | « Vous avez déjà N emprunts en cours. » |
| Jeu déjà emprunté | « Vous avez déjà ce jeu. » |
| Aucun exemplaire | « Aucun exemplaire disponible : réservez-le. » |
| Jeu retiré | « Jeu indisponible. » |
| Retour sans retard | « Jeu rendu, merci ! » |
| Retour en retard | « Jeu rendu avec N jour(s) de retard : pénalité de X EUR. » |
| Prolongation acceptée | « Prolongation acceptée : nouveau retour le JJ/MM/AAAA. » |
| Prolongation refusée | « Prolongation impossible : déjà prolongé. » / « … : emprunt en retard. » / « … : jeu réservé. » |
| Réservation enregistrée | « Réservation enregistrée : <jeu>, position N. » |
| Réservation impossible | « Un exemplaire est disponible : empruntez-le. » / « Vous avez déjà réservé ce jeu. » / « Vous avez déjà 2 réservations en attente. » |
| Réservation annulée | « Réservation annulée. » |
| Compte créé | « Compte créé, vous pouvez vous connecter. » |
| Mot de passe faible | « Le mot de passe doit contenir au moins 8 caractères dont un chiffre. » |
| Email déjà utilisé | « Cet email est déjà utilisé. » |
| Champs manquants | « Tous les champs sont obligatoires. » |

## Façade de données (`js/api.js`)

Chaque page expose la façade sur `window.meeple` : `chargerJeux({ joueurs, dureeMax, recherche })`,
`chargerJeu(id)`, `connexion`, `deconnexion`, `inscription`, `emprunter(jeuId)`,
`rendre(empruntId)`, `prolonger(empruntId)`, `reserver(jeuId)`, `annulerReservation(id)`,
`mesEmprunts`, `mesReservations`, `membreConnecte`, `reinitialiser`. Les fonctions renvoient
des promesses et rejettent avec un objet `{ erreur, message }` (codes : `identifiants_invalides`,
`champs_requis`, `mot_de_passe_faible`, `email_deja_utilise`, `jeu_inconnu`, `jeu_indisponible`,
`deja_emprunte`, `quota_atteint`, `aucun_exemplaire`, `emprunt_inconnu`, `deja_rendu`,
`deja_prolonge`, `en_retard`, `jeu_reserve`, `exemplaire_disponible`, `deja_reserve`,
`quota_reservations`, `reservation_inconnue`, `deja_annulee`, `non_authentifie`,
`acces_refuse`, `chargement_impossible`).

Les règles pures (durée, quota, pénalité, prolongation) sont dans `js/regles.js` et importables
depuis Node.js : `import { penalite } from '../app/js/regles.js'`.

Clés `localStorage` : `meeple.token`, `meeple.membre`, `meeple.emprunts`,
`meeple.reservations`, `meeple.membres-crees`.
