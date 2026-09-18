import { test, expect } from "../utils/fixture.js";
import { reinitialiser } from "../utils/reset.js";
import { connecter } from "../utils/auth.js";
import { PageJeu } from "../pages/pageJeu.js";
import { PageMesEmprunts } from "../pages/pageEmprunts.js";
import { dateRetourPrevue, formaterDate } from "../utils/oracles.js";
import { dateISO } from "../utils/dates.js";

test("quota atteint", async ({ page }) => {
  await reinitialiser(page);
  await connecter(page, "testeur@exemple.fr");
  await page.goto("/jeu.html?id=J4");
  await page.getByRole("button", { name: "Emprunter" }).click();
  await expect(page.locator("#message")).toHaveText(
    "Vous avez déjà 2 emprunts en cours.",
  );
});

test("emprunt premium : durée et disponibilité", async ({ page }) => {
  await reinitialiser(page);
  await connecter(page, "premium@exemple.fr");
  const jeu = new PageJeu(page);
  await jeu.aller("J6");

  const attendu = dateRetourPrevue(dateISO(), true);
  await jeu.emprunter();

  await expect(jeu.message).toHaveText(
    `Emprunt confirmé : Pandemic, à rendre le ${formaterDate(attendu)}.`,
  );
  await expect(jeu.disponibilite).toHaveText("Aucun exemplaire disponible");
});

test("quota premium atteint au quatrième emprunt", async ({ page }) => {
  await reinitialiser(page);
  await connecter(page, "premium@exemple.fr");
  await page.evaluate(async () => {
    await window.meeple.emprunter("J4");
    await window.meeple.emprunter("J5");
  });

  const resultat = await page.evaluate(async () => {
    try {
      await window.meeple.emprunter("J6");
      return null;
    } catch (e) {
      return { erreur: e.erreur, message: e.message };
    }
  });

  expect(resultat).toEqual({
    erreur: "quota_atteint",
    message: "Vous avez déjà 3 emprunts en cours.",
  });
});

test("compteur premium : quota de 3", async ({ page }) => {
  await reinitialiser(page);
  await connecter(page, "premium@exemple.fr");
  await page.evaluate(async () => {
    await window.meeple.emprunter("J4");
    await window.meeple.emprunter("J5");
  });

  const mesEmprunts = new PageMesEmprunts(page);
  await mesEmprunts.aller();
  await expect(mesEmprunts.compteur).toHaveText("3 emprunts en cours sur 3");
});

test("fiche visiteur : date de retour calculée", async ({ page }) => {
  await reinitialiser(page);
  const jeu = new PageJeu(page);
  await jeu.aller("J6");

  const attendu = dateRetourPrevue(dateISO(), false);
  await expect(jeu.retourPrevu).toHaveText(formaterDate(attendu));
});

test("fiche premium : date de retour calculée", async ({ page }) => {
  await reinitialiser(page);
  await connecter(page, "premium@exemple.fr");
  const jeu = new PageJeu(page);
  await jeu.aller("J6");

  const attendu = dateRetourPrevue(dateISO(), true);
  await expect(jeu.retourPrevu).toHaveText(formaterDate(attendu));
});

test("jeu déjà emprunté par le membre", async ({ page }) => {
  await reinitialiser(page);
  await connecter(page, "premium@exemple.fr");
  await page.evaluate(() => window.meeple.emprunter("J6"));

  const resultat = await page.evaluate(async () => {
    try {
      await window.meeple.emprunter("J6");
      return null;
    } catch (e) {
      return { erreur: e.erreur, message: e.message };
    }
  });

  expect(resultat).toEqual({
    erreur: "deja_emprunte",
    message: "Vous avez déjà ce jeu.",
  });
});

test("jeu déjà emprunté par un autre membre", async ({ page }) => {
  await reinitialiser(page);
  await connecter(page, "premium@exemple.fr");
  await page.evaluate(() => window.meeple.emprunter("J6"));

  await connecter(page, "standard@exemple.fr");
  const jeu = new PageJeu(page);
  await jeu.aller("J6");

  await expect(jeu.disponibilite).toHaveText("Aucun exemplaire disponible");
  await expect(jeu.boutonEmprunter).toHaveCount(0);
});

test("aucun exemplaire : façade et bouton Emprunter absent", async ({ page }) => {
  await reinitialiser(page);
  await connecter(page, "premium@exemple.fr");
  await page.evaluate(() => window.meeple.emprunter("J6"));
  await connecter(page, "standard@exemple.fr");

  const resultat = await page.evaluate(async () => {
    try {
      await window.meeple.emprunter("J6");
      return null;
    } catch (e) {
      return { erreur: e.erreur, message: e.message };
    }
  });

  expect(resultat).toEqual({
    erreur: "aucun_exemplaire",
    message: "Aucun exemplaire disponible : réservez-le.",
  });

  const jeu = new PageJeu(page);
  await jeu.aller("J6");
  await expect(jeu.boutonEmprunter).toHaveCount(0);
});
