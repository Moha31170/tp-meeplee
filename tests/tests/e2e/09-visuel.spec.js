import { test, expect } from "../utils/fixture.js";

test("visuel — page Connexion", { tag: "@etendu" }, async ({ page }) => {
  await page.goto("/connexion.html");
  await expect(page).toHaveScreenshot("connexion.png", {
    fullPage: true,
  });
});

test("visuel — Mes emprunts sans les colonnes de dates", { tag: "@etendu" }, async ({
  page,
  membreConnecte,
}) => {
  await page.goto("/mes-emprunts.html");

  // Les colonnes « Emprunté le » et « Retour prévu » sont masquées
  // pour que les dates relatives ne rendent pas la référence instable.
  await page.addStyleTag({
    content: `
      #emprunts th:nth-child(2),
      #emprunts td:nth-child(2),
      #emprunts th:nth-child(3),
      #emprunts td:nth-child(3) {
        display: none !important;
      }
    `,
  });

  await expect(page).toHaveScreenshot("mes-emprunts-sans-dates.png", {
    fullPage: true,
  });
});
