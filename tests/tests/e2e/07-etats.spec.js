import { test, expect } from "../utils/fixture.js";
import { reinitialiser } from "../utils/reset.js";
import { PageCatalogue } from "../pages/pageCatalogue.js";

const JEUX_URL = "**/donnees/jeux.json";

test("catalogue vide : affiche le texte exact de la spécification", async ({
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

  await expect(catalogue.message).toHaveText("Aucun jeu ne correspond.");
  await expect(page.locator("#chargement")).toBeHidden();
  await expect(catalogue.cartes).toHaveCount(0);
});

test("erreur HTTP 500 : affiche le texte exact de la spécification", async ({
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

  await expect(catalogue.message).toHaveText(
    "Impossible de charger le catalogue.",
  );
  await expect(page.locator("#chargement")).toBeHidden();
});

test("réponse lente de 1,5 s : le chargement apparaît puis disparaît", async ({
  page,
}) => {
  await reinitialiser(page);

  await page.route(JEUX_URL, async (route) => {
    const response = await route.fetch();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.fulfill({ response });
  });

  const catalogue = new PageCatalogue(page);
  const navigation = catalogue.aller();

  await expect(page.locator("#chargement")).toBeVisible();

  await navigation;

  await expect(page.locator("#chargement")).toBeHidden();
  await expect(catalogue.cartes).toHaveCount(8);
});
