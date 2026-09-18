export const VERDICTS = [
  "valide",
  "mot_de_passe_faible",
  "email_deja_utilise",
  "champs_requis",
];

// Comptes de démonstration existants (spécification), en minuscules.
export const EMAILS_EXISTANTS = [
  "testeur@exemple.fr",
  "premium@exemple.fr",
  "standard@exemple.fr",
];

// L'oracle : le verdict que l'application doit donner, dans l'ordre de la spécification.
export function verdictAttendu(demande, emailsPris) {
  if (!demande.prenom || !demande.email || !demande.motDePasse)
    return "champs_requis";
  if (demande.motDePasse.length < 8 || !/[0-9]/.test(demande.motDePasse))
    return "mot_de_passe_faible";
  if (emailsPris.has(demande.email.trim().toLowerCase()))
    return "email_deja_utilise";
  return "valide";
}

export function validerJeu(demandes, { nombre }) {
  const erreurs = [];
  if (!Array.isArray(demandes))
    return { valide: false, erreurs: ["la réponse n'est pas un tableau"] };
  if (demandes.length !== nombre)
    erreurs.push(`${demandes.length} demandes au lieu de ${nombre}`);
  const emailsPris = new Set(EMAILS_EXISTANTS);
  demandes.forEach((d, i) => {
    const idAttendu = `INS-${String(i + 1).padStart(2, "0")}`;
    if (d.id !== idAttendu)
      erreurs.push(`${d.id ?? "(sans id)"} : identifiant attendu ${idAttendu}`);
    for (const champ of ["prenom", "email", "motDePasse", "attendu", "motif"]) {
      if (typeof d[champ] !== "string")
        erreurs.push(`${d.id} : champ ${champ} manquant ou non textuel`);
    }
    if (typeof d.premium !== "boolean")
      erreurs.push(`${d.id} : premium doit être un booléen`);
    if (!VERDICTS.includes(d.attendu))
      erreurs.push(`${d.id} : attendu « ${d.attendu} » inconnu`);
    if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
      erreurs.push(`${d.id} : email « ${d.email} » mal formé`);
    const verdict = verdictAttendu(d, emailsPris);
    if (VERDICTS.includes(d.attendu) && verdict !== d.attendu) {
      erreurs.push(
        `${d.id} : attendu « ${d.attendu} » mais l'oracle RG-INSCRIPTION donne « ${verdict} » (${d.motif})`,
      );
    }
    if (verdict === "valide") emailsPris.add(d.email.trim().toLowerCase());
  });
  for (const v of VERDICTS) {
    if (!demandes.some((d) => d.attendu === v))
      erreurs.push(`aucune demande avec le verdict « ${v} »`);
  }
  if (
    !demandes.some((d) => d.attendu === "valide" && d.motDePasse.length === 8)
  )
    erreurs.push(
      "aucun mot de passe valide de 8 caractères exactement (borne)",
    );
  if (
    !demandes.some(
      (d) => d.attendu === "mot_de_passe_faible" && d.motDePasse.length === 7,
    )
  )
    erreurs.push("aucun mot de passe de 7 caractères (sous la borne)");
  if (
    !demandes.some(
      (d) =>
        d.attendu === "email_deja_utilise" && d.email !== d.email.toLowerCase(),
    )
  )
    erreurs.push("aucun email existant écrit dans une autre casse");
  return { valide: erreurs.length === 0, erreurs };
}
