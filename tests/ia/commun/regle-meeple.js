export const REGLES_MEEPLE = `Règles métier de l'application école Meeple (ludothèque en ligne) :
- RG-DUREE : emprunt de 14 jours (standard) ou 21 jours (premium) ; retour prévu = emprunt + durée ; rendu le jour même = pas de retard ; dates au format JJ/MM/AAAA.
- RG-QUOTA : au plus 2 emprunts en cours (standard) ou 3 (premium), sinon « Vous avez déjà N emprunts en cours. » ; compteur « N emprunt(s) en cours sur Q » avec Q le quota du membre ; au plus 2 réservations en attente.
- RG-RETARD : 0,50 EUR par jour de retard, plafonnés à 10,00 EUR ; retard compté en jours après la date de retour prévue.
- RG-PROLONGATION : une prolongation de 7 jours ; refusée si déjà prolongé, en retard, ou si un autre membre a réservé le jeu (« Prolongation impossible : jeu réservé. »).
- RG-EMPRUNT : refus dans l'ordre : jeu retiré, jeu déjà emprunté, quota atteint, aucun exemplaire libre.
- RG-RESERVATION : possible seulement sans exemplaire libre ; position = rang dans la file ; annulation à tout moment ; la file ne donne aucune priorité, la réservation reste en attente jusqu'à ce que son auteur emprunte le jeu (elle est alors satisfaite).
- RG-CATALOGUE : recherche insensible à la casse et aux accents ; filtre joueurs N : joueurs minimum <= N <= joueurs maximum ; filtre durée maximale ; « 4 joueurs » donne 8 jeux, « 8 joueurs » donne Codenames seul.
- RG-INSCRIPTION : champs obligatoires ; mot de passe d'au moins 8 caractères dont un chiffre ; email unique, comparaison insensible à la casse.
- États de la page Catalogue : « Chargement du catalogue… » pendant le chargement ; « Impossible de charger le catalogue. » si le chargement échoue ; « Aucun jeu ne correspond. » si la liste est vide.
- Accessibilité : aucune violation WCAG A / AA relevée par axe-core sur les cinq pages.
- Rendu mobile : aucun défilement horizontal sur un écran de 412 px, nom des jeux lisible.
Pages :
- Page Catalogue : /index.html
- Page Fiche du jeu : /jeu.html?id=<id>
- Page Mes emprunts : /mes-emprunts.html
- Page Connexion : /connexion.html
- Page Inscription : /inscription.html`;
