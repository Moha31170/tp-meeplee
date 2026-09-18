// ia/scripts/triage-ia.js
const fs = require("fs");
const path = require("path");
const { demander } = require("../commun/ia");
const reglesMeeple = require("../commun/regles-meeple.js");

const RAPPORT_PATH = path.join(
  __dirname,
  "../../tests/test-results/playwright-report.json",
);

async function trierEchecs() {
  if (!fs.existsSync(RAPPORT_PATH)) {
    console.error(
      "Rapport JSON introuvable. Exécutez 'npm run test:e2e:json' d'abord.",
    );
    return;
  }

  const rapport = JSON.parse(fs.readFileSync(RAPPORT_PATH, "utf8"));
  const suites = rapport.suites || [];
  let indexAnomalie = 1;

  for (const suite of suites) {
    for (const spec of suite.specs) {
      const test = spec.tests[0];
      const status = test.results[0].status;

      if (status !== "expected") {
        const messageErreur = test.results[0].error.message;
        const titreTest = spec.title;

        const promptTriage = `Tâche : triage
Analyse cet échec de test automatisé et identifie s'il s'agit d'une anomalie probable de l'application ou du test.
Titre du test : ${titreTest}
Erreur : ${messageErreur}

Règles de spécification :
${reglesMeeple}

- Page Inscription : /inscription
Renvoie UNIQUEMENT une explication concise du problème.`;

        const analyseIA = await demander(promptTriage);

        // Génération de la fiche Markdown
        const contenuMd = `# Fiche de Triage - Anomalie Probable #${indexAnomalie}

**Test en échec** : ${titreTest}
**Erreur remontée** : \n\`\`\`text\n${messageErreur}\n\`\`\`

## Analyse de l'IA
${analyseIA}

---
## Relecture Humaine
**Décision** : [ ] Corrigé [ ] Rejeté [ ] À planifier
**Date** : 
**Signature** : 
`;
        const nomFichier = `fiche-anomalie-${indexAnomalie}.md`;
        fs.writeFileSync(path.join(__dirname, "../../", nomFichier), contenuMd);
        console.log(`Fiche générée : ${nomFichier}`);
        indexAnomalie++;
      }
    }
  }

  // Génération du bilan
  const contenuBilan = `console.log("Bilan de triage : ${indexAnomalie - 1} fiches d'anomalies générées. Coût estimé : 0€ (Simulateur local).");`;
  fs.writeFileSync(path.join(__dirname, "bilan-ia.js"), contenuBilan);
}

trierEchecs();
