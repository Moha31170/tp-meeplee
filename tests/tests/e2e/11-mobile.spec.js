import { test, expect } from "@playwright/test";

test("mobile — catalogue sans débordement horizontal", { tag: "@etendu" }, async ({ page }) => {
  await page.goto("/index.html");

  const largeur = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect.soft(
    largeur.scrollWidth,
    "La page ne doit pas avoir de défilement horizontal",
  ).toBeLessThanOrEqual(largeur.viewport);

  const cartes = page.locator("li.jeu");
  const viewport = await page.evaluate(() => document.documentElement.clientWidth);

  const nombreCartes = await cartes.count();
  for (let i = 0; i < nombreCartes; i++) {
    const carte = cartes.nth(i);
    const box = await carte.boundingBox();
    if (!box) continue;

    expect.soft(
      box.x + box.width,
      `Le bord droit de la carte ${i + 1} doit rester dans le viewport`,
    ).toBeLessThanOrEqual(viewport);
  }

  const taillePolice = await cartes.first().locator(".nom").evaluate(
    (element) => Number.parseFloat(getComputedStyle(element).fontSize),
  );

  expect.soft(
    taillePolice,
    "Le nom d'un jeu doit conserver une taille de police de 20 px",
  ).toBe(20);
});
