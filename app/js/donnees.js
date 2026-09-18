// Jeu de données initial de Meeple : emprunts et réservations créés par rapport
// à la date du jour, pour que les scénarios (retard, prolongation) restent vrais.
import { ajouterJours } from './dates.js';
import { dateRetourPrevue } from './regles.js';

function emprunt(id, membreId, jeuId, nom, ilYAJours, premium, aujourdhui) {
  const dateEmprunt = ajouterJours(aujourdhui, -ilYAJours);
  return {
    id,
    membreId,
    jeuId,
    jeu: { id: jeuId, nom },
    dateEmprunt,
    dateRetourPrevue: dateRetourPrevue(dateEmprunt, premium),
    prolonge: false,
    statut: 'en_cours',
    dateRendu: null,
    joursRetard: 0,
    penalite: 0
  };
}

export function creerEtatInitial(aujourdhui) {
  return {
    emprunts: [
      emprunt('E1', 'M1', 'J1', 'Catan', 10, false, aujourdhui),      // retour dans 4 jours, réservé par Inès
      emprunt('E2', 'M1', 'J2', 'Dixit', 20, false, aujourdhui),      // retour il y a 6 jours : en retard
      emprunt('E3', 'M2', 'J3', '7 Wonders', 5, true, aujourdhui),    // premium : retour dans 16 jours
      emprunt('E4', 'M3', 'J4', 'Azul', 3, false, aujourdhui)         // retour dans 11 jours
    ],
    reservations: [
      { id: 'R1', membreId: 'M3', jeuId: 'J1', jeu: { id: 'J1', nom: 'Catan' }, date: ajouterJours(aujourdhui, -2), statut: 'en_attente' }
    ]
  };
}
