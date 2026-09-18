// Dates de test : toujours calculées, jamais codées en dur.
// L'application affiche des dates calendaires au format JJ/MM/AAAA, en date de Paris.
const FUSEAU = 'Europe/Paris';

// "AAAA-MM-JJ" d'un instant, en date de Paris.
export function dateISO(instant = new Date()) {
  return new Intl.DateTimeFormat('fr-CA', { timeZone: FUSEAU, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant);
}

// "AAAA-MM-JJ" du jour + n jours (n négatif accepté).
export function isoDansNJours(n, depuis = new Date()) {
  return dateISO(new Date(depuis.getTime() + n * 24 * 60 * 60 * 1000));
}

// "JJ/MM/AAAA" du jour + n jours : le format affiché par l'application.
export function dateDansNJours(n, depuis = new Date()) {
  const [annee, mois, jour] = isoDansNJours(n, depuis).split('-');
  return `${jour}/${mois}/${annee}`;
}

// Instant de référence figé pour les tests qui dépendent de la date du jour :
// lundi 15 mars 2027, 09:00 à Paris.
export const INSTANT_FIXE = new Date('2027-03-15T09:00:00+01:00');
