const DUREE_JOURS = { standard: 14, premium: 21 }; // RG-DUREE
const PENALITE_PAR_JOUR = 0.5; // RG-RETARD
const PENALITE_MAX = 10; // RG-RETARD : "plafonnés à 10,00 EUR"
const JOUR_MS = 86400000;

function versUTC(iso) {
  const [annee, mois, jour] = iso.split("-").map(Number);
  return Date.UTC(annee, mois - 1, jour);
}

function versISO(millisecondes) {
  return new Date(millisecondes).toISOString().slice(0, 10);
}

export function dateRetourPrevue(dateEmprunt, premium) {
  const duree = premium ? DUREE_JOURS.premium : DUREE_JOURS.standard;
  return versISO(versUTC(dateEmprunt) + duree * JOUR_MS);
}

export function joursDeRetard(dateRetourPrevueVal, dateDuJour) {
  const diff = Math.round(
    (versUTC(dateDuJour) - versUTC(dateRetourPrevueVal)) / JOUR_MS,
  );
  return Math.max(0, diff);
}

export function penalite(joursRetard) {
  const brut = Math.round(PENALITE_PAR_JOUR * joursRetard * 100) / 100;
  return Math.min(brut, PENALITE_MAX);
}

export function refusProlongation({
  prolonge,
  joursRetard,
  reserveParUnAutre,
}) {
  if (prolonge) return "deja_prolonge";
  if (joursRetard > 0) return "en_retard";
  if (reserveParUnAutre) return "jeu_reserve";
  return null;
}

export function formaterEuros(montant) {
  return `${montant.toFixed(2).replace(".", ",")} EUR`;
}

export function formaterDate(iso) {
  const [annee, mois, jour] = iso.split("-");
  return `${jour}/${mois}/${annee}`;
}
