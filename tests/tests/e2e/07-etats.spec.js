import { test, expect } from "../utils/fixture.js";
import { reinitialiser } from "../utils/reset.js";
import { PageCatalogue } from "../pages/pageCatalogue.js";
import { simulerLatence } from "../utils/reseau.js";

const JEUX_URL = "**/donnees/jeux.json";

test("catalogue vide : affiche le texte exact de la spécification", { tag: "@etendu" }, async ({
  page,
}) => {
  await reinitialiser(page);

  await page.route(JEUX_URL, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });

  const catalogue = new PageCatalogue(page);
  await catalogue.aller();

  // Spécification : « Aucun jeu ne correspond. »
  // Élément porteur : <p id="message">.
  await expect(catalogue.message).toHaveText("Aucun jeu ne correspond.");
  await expect(page.locator("#chargement")).toBeHidden();
  await expect(catalogue.cartes).toHaveCount(0);
});

test("erreur HTTP 500 : affiche le texte exact de la spécification", { tag: "@etendu" }, async ({
  page,
}) => {
  await reinitialiser(page);

  await page.route(JEUX_URL, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ erreur: "serveur_indisponible" }),
    });
  });

  const catalogue = new PageCatalogue(page);
  await catalogue.aller();

  // Spécification : « Impossible de charger le catalogue. »
  // Élément porteur : <p id="message">.
  await expect(catalogue.message).toHaveText(
    "Impossible de charger le catalogue.",
  );
  await expect(page.locator("#chargement")).toBeHidden();
});

test("réponse lente de 1,5 s : le chargement apparaît puis disparaît", { tag: "@etendu" }, async ({
  page,
}) => {
  await reinitialiser(page);

  await simulerLatence(page, 1500, JEUX_URL);

  const catalogue = new PageCatalogue(page);
  const navigation = catalogue.aller();

  // Spécification : « Chargement du catalogue… » pendant le chargement.
  // Élément porteur : <p id="chargement">.
  await expect(page.locator("#chargement")).toBeVisible();

  await navigation;

  await expect(page.locator("#chargement")).toBeHidden();
  await expect(catalogue.cartes).toHaveCount(8);
});
