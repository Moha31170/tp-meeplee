import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "../utils/fixture.js";

async function auditer(page, testInfo, nomPage) {
  const resultat = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();

  for (const violation of resultat.violations) {
    console.log(
      `[axe] ${nomPage} | ${violation.id} | ${violation.impact ?? "sans impact"} | ${violation.help}`,
    );
    await testInfo.attach(`axe-${nomPage}-${violation.id}.json`, {
      body: JSON.stringify(violation, null, 2),
      contentType: "application/json",
    });
  }

  // Blocage final : la liste des identifiants doit être vide.
  expect(
    resultat.violations.map((violation) => violation.id),
    `Violations axe-core sur ${nomPage}`,
  ).toEqual([]);
}

test("accessibilité — Catalogue", async ({ page }, testInfo) => {
  await page.goto("/index.html");
  await auditer(page, testInfo, "catalogue");
});

test("accessibilité — Fiche du jeu", async ({ page }, testInfo) => {
  await page.goto("/jeu.html?id=J1");
  await auditer(page, testInfo, "jeu");
});

test("accessibilité — Connexion", async ({ page }, testInfo) => {
  await page.goto("/connexion.html");
  await auditer(page, testInfo, "connexion");
});

test("accessibilité — Inscription", async ({ page }, testInfo) => {
  await page.goto("/inscription.html");
  await auditer(page, testInfo, "inscription");
});

test("accessibilité — Mes emprunts (page connectée par fixture)", async ({
  page,
  membreConnecte,
}, testInfo) => {
  await page.goto("/mes-emprunts.html");
  await auditer(page, testInfo, "mes-emprunts");
});
