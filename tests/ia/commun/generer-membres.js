// ia/scripts/generer-membres.js
const fs = require("fs");
const path = require("path");
const { demander } = require("../commun/ia");
const { validerInscriptions } = require("../commun/validation-membres");

const MAX_TENTATIVES = 3;
const CHEMIN_ARTIFACT = path.join(
  __dirname,
  "../../tests/donnees/inscriptions-generees.json",
);

async function executer() {
  let promptOriginal = `Tâche : génération de demandes d'inscription
Génère un tableau JSON contenant des objets de demandes d'inscription.
Chaque objet doit avoir : "nom", "prenom", "email", "motDePasse", et "verdictAttendu" (booléen).

- RG-INSCRIPTION : Le mot de passe doit contenir au moins 8 caractères. L'email doit être unique dans la base, sans distinction de casse.

Assure-toi d'inclure des cas valides, des cas invalides, des mots de passe de 7 et 8 caractères, et un test de casse sur l'email.`;

  let promptActuel = promptOriginal;

  for (let tentative = 1; tentative <= MAX_TENTATIVES; tentative++) {
    console.log(`Tentative ${tentative}...`);
    try {
      const reponse = await demander(promptActuel);

      // Extraction du JSON depuis la réponse
      const matchJson = reponse.match(/\[.*\]/s);
      if (!matchJson)
        throw new Error("Aucun tableau JSON trouvé dans la réponse.");

      const donnees = JSON.parse(matchJson[0]);
      const validation = validerInscriptions(donnees);

      if (validation.valide) {
        fs.writeFileSync(CHEMIN_ARTIFACT, JSON.stringify(donnees, null, 2));
        console.log(
          `Génération réussie à la tentative ${tentative}. Données sauvegardées dans ${CHEMIN_ARTIFACT}`,
        );
        return;
      } else {
        console.log("Erreurs de validation :", validation.erreurs);
        promptActuel =
          promptOriginal +
          `\n\nLors de la précédente tentative, ton JSON a généré ces erreurs. Corrige-les :\n- ` +
          validation.erreurs.join("\n- ");
      }
    } catch (erreur) {
      console.error("Erreur d'exécution :", erreur.message);
      promptActuel =
        promptOriginal +
        `\n\nErreur lors de la lecture du JSON : ${erreur.message}`;
    }
  }
  console.error(
    "Échec de la génération après le nombre maximum de tentatives.",
  );
}

executer();
