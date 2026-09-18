// Dates calendaires de Meeple : chaînes "AAAA-MM-JJ", sans heure, en date de Paris.
const FUSEAU = 'Europe/Paris';

// La date du jour ("AAAA-MM-JJ") en heure de Paris. new Date() est évalué à
// l'appel : un test peut figer l'horloge du navigateur (page.clock).
export function aujourdhuiISO(maintenant = new Date()) {
  return new Intl.DateTimeFormat('fr-CA', {
    timeZone: FUSEAU, year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(maintenant);
}

function versUTC(iso) {
  const [annee, mois, jour] = iso.split('-').map(Number);
  return Date.UTC(annee, mois - 1, jour);
}

function versISO(millisecondes) {
  return new Date(millisecondes).toISOString().slice(0, 10);
}

// "AAAA-MM-JJ" + n jours (n peut être négatif).
export function ajouterJours(iso, n) {
  return versISO(versUTC(iso) + n * 86400000);
}

// Nombre de jours entre deux dates : positif si a est après b.
export function differenceJours(a, b) {
  return Math.round((versUTC(a) - versUTC(b)) / 86400000);
}

// "AAAA-MM-JJ" -> "JJ/MM/AAAA", le format affiché dans l'application.
export function formaterDate(iso) {
  const [annee, mois, jour] = iso.split('-');
  return `${jour}/${mois}/${annee}`;
}
