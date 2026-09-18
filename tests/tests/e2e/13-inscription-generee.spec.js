import { test, expect } from "@playwright/test";
import fs from "fs";

const donneesChemin = new URL(
  "../donnees/inscriptions-generees.json",
  import.meta.url,
);

let inscriptions = [];
try {
  inscriptions = JSON.parse(fs.readFileSync(donneesChemin, "utf8"));
} catch (erreur) {
  console.warn(
    "Le fichier inscriptions-generees.json est introuvable. Exécutez d'abord le script de génération.",
  );
}

test.describe("Validation dynamique des inscriptions générées par IA", () => {
  for (const demande of inscriptions) {
    test(`Test de l'inscription pour ${demande.email} (Attendu: ${demande.verdictAttendu})`, async ({
      page,
    }) => {
      await page.goto("/inscription");

      await page.fill("#nom", demande.nom || "Test");
      await page.fill("#prenom", demande.prenom || "Test");
      await page.fill("#email", demande.email);
      await page.fill("#motDePasse", demande.motDePasse);
      await page.click('button[type="submit"]');

      if (demande.verdictAttendu) {
        await expect(page.locator(".message-succes")).toBeVisible();
      } else {
        await expect(page.locator(".message-erreur")).toBeVisible();
      }
    });
  }
});
