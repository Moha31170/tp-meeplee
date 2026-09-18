// ia/commun/validation-membres.js
function validerInscriptions(demandes) {
  const erreurs = [];
  const emailsVus = new Set();

  let couverture = {
    verdictValide: false,
    verdictInvalide: false,
    mdp7Caracteres: false,
    mdp8Caracteres: false,
    emailCasseDifferente: false,
  };

  if (!Array.isArray(demandes) || demandes.length === 0) {
    return {
      valide: false,
      erreurs: [
        "La réponse doit être un tableau non vide contenant les demandes.",
      ],
    };
  }

  demandes.forEach((demande, index) => {
    // Validation des champs requis
    if (
      !demande.email ||
      !demande.motDePasse ||
      demande.verdictAttendu === undefined
    ) {
      erreurs.push(
        `Demande ${index} : Champs manquants (email, motDePasse, ou verdictAttendu).`,
      );
      return;
    }

    const emailMinuscule = demande.email.toLowerCase();
    let estValideMetier = true;

    // RG-INSCRIPTION : Longueur du mot de passe
    if (demande.motDePasse.length < 8) {
      estValideMetier = false;
    }
    if (demande.motDePasse.length === 7) couverture.mdp7Caracteres = true;
    if (demande.motDePasse.length === 8) couverture.mdp8Caracteres = true;

    // RG-INSCRIPTION : Unicité de l'email (insensible à la casse)
    if (emailsVus.has(emailMinuscule)) {
      estValideMetier = false;
      // Vérification de la couverture : doublon avec casse différente
      const emailsExistants = Array.from(emailsVus);
      if (
        emailsExistants.some((e) => e === emailMinuscule && e !== demande.email)
      ) {
        couverture.emailCasseDifferente = true;
      }
    }
    emailsVus.add(emailMinuscule);

    // Validation du verdict attendu par l'IA
    if (demande.verdictAttendu === true && !estValideMetier) {
      erreurs.push(
        `Demande ${index} (${demande.email}) : Le verdict attendu est 'true' mais la demande enfreint une règle.`,
      );
    } else if (demande.verdictAttendu === false && estValideMetier) {
      erreurs.push(
        `Demande ${index} (${demande.email}) : Le verdict attendu est 'false' mais la demande est valide.`,
      );
    }

    if (demande.verdictAttendu === true) couverture.verdictValide = true;
    if (demande.verdictAttendu === false) couverture.verdictInvalide = true;
  });

  // Contrôle des exigences de couverture
  if (!couverture.verdictValide)
    erreurs.push(
      "Couverture : Il manque au moins une demande valide (verdictAttendu: true).",
    );
  if (!couverture.verdictInvalide)
    erreurs.push(
      "Couverture : Il manque au moins une demande invalide (verdictAttendu: false).",
    );
  if (!couverture.mdp7Caracteres)
    erreurs.push(
      "Couverture : Il manque un mot de passe aux limites (7 caractères).",
    );
  if (!couverture.mdp8Caracteres)
    erreurs.push(
      "Couverture : Il manque un mot de passe aux limites (8 caractères).",
    );
  if (!couverture.emailCasseDifferente)
    erreurs.push(
      "Couverture : Il manque une tentative d'inscription avec un email existant mais une casse différente.",
    );

  return {
    valide: erreurs.length === 0,
    erreurs,
  };
}

module.exports = { validerInscriptions };
