// Règles métier de Meeple (RG-DUREE, RG-QUOTA, RG-RETARD, RG-PROLONGATION).
// Fonctions pures : elles servent à l'application et peuvent être confrontées
// à un oracle écrit depuis la spécification.
import { ajouterJours, differenceJours } from './dates.js';

export const DUREE_JOURS = { standard: 14, premium: 21 };
export const QUOTA_EMPRUNTS = { standard: 2, premium: 3 };
export const QUOTA_RESERVATIONS = 2;
export const PENALITE_PAR_JOUR = 0.5;
export const PENALITE_MAX = 10;
export const PROLONGATION_JOURS = 7;

export function dureeEmprunt(premium) {
  return premium ? DUREE_JOURS.premium : DUREE_JOURS.standard;
}

export function quotaEmprunts(premium) {
  return premium ? QUOTA_EMPRUNTS.premium : QUOTA_EMPRUNTS.standard;
}

// Date de retour prévue : date d'emprunt + durée selon l'adhésion.
export function dateRetourPrevue(dateEmprunt, premium) {
  return ajouterJours(dateEmprunt, dureeEmprunt(premium));
}

// Jours de retard à une date donnée : 0 le jour du retour prévu et avant.
export function joursDeRetard(dateRetourPrevue, aujourdhui) {
  return Math.max(0, differenceJours(aujourdhui, dateRetourPrevue));
}

// Pénalité de retard en euros.
export function penalite(joursRetard) {
  return Math.round(PENALITE_PAR_JOUR * joursRetard * 100) / 100;
}

// Motif de refus d'une prolongation, ou null si elle est possible.
export function refusProlongation({ prolonge, joursRetard, reserveParUnAutre }) {
  if (prolonge) return 'deja_prolonge';
  if (joursRetard > 0) return 'en_retard';
  if (reserveParUnAutre) return 'jeu_reserve';
  return null;
}

// 3.5 -> "3,50 EUR"
export function formaterEuros(montant) {
  return `${montant.toFixed(2).replace('.', ',')} EUR`;
}
