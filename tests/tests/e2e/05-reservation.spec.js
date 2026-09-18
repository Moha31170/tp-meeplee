import { test, expect } from "../utils/fixture.js";
import { reinitialiser } from "../utils/reset.js";
import { connecter } from "../utils/auth.js";
import { PageMesEmprunts } from "../pages/pageEmprunts.js";
import { PageJeu } from "../pages/pageJeu.js";

test("position dans la file : 1 puis 2", async ({ page }) => {
  await reinitialiser(page);

  await connecter(page, "premium@exemple.fr");
  await page.evaluate(() => window.meeple.emprunter("J6"));

  await connecter(page, "testeur@exemple.fr");
  await page.evaluate(() => window.meeple.reserver("J6"));

  await connecter(page, "standard@exemple.fr");
  const jeu = new PageJeu(page);
  await jeu.aller("J6");
  await jeu.reserver();
  await expect(jeu.message).toHaveText(
    "Réservation enregistrée : Pandemic, position 2.",
  );

  const mesEmprunts = new PageMesEmprunts(page);
  await mesEmprunts.aller();
  await expect(mesEmprunts.reservation("Pandemic")).toHaveText(
    "Pandemic — position 2Annuler",
  );

  await connecter(page, "testeur@exemple.fr");
  await mesEmprunts.aller();
  await expect(mesEmprunts.reservation("Pandemic")).toContainText("position 1");
});

test("première réservation : position calculée à 1", async ({ page }) => {
  await reinitialiser(page);
  await connecter(page, "premium@exemple.fr");
  await page.evaluate(() => window.meeple.emprunter("J6"));

  await connecter(page, "testeur@exemple.fr");
  const jeu = new PageJeu(page);
  await jeu.aller("J6");
  await jeu.reserver();

  await expect(jeu.message).toHaveText(
    "Réservation enregistrée : Pandemic, position 1.",
  );
});

test("réservation enregistrée : la fiche passe par le bouton Réserver", async ({
  page,
}) => {
  await reinitialiser(page);
  await connecter(page, "premium@exemple.fr");
  await page.evaluate(() => window.meeple.emprunter("J6"));

  await connecter(page, "testeur@exemple.fr");
  const jeu = new PageJeu(page);
  await jeu.aller("J6");

  await expect(jeu.boutonReserver).toBeVisible();
  await expect(jeu.boutonEmprunter).toHaveCount(0);
  await jeu.reserver();

  await expect(jeu.message).toHaveText(
    "Réservation enregistrée : Pandemic, position 1.",
  );
});

test("annulation d'une réservation", async ({ page }) => {
  await reinitialiser(page);
  await connecter(page, "premium@exemple.fr");
  await page.evaluate(() => window.meeple.emprunter("J6"));

  await connecter(page, "testeur@exemple.fr");
  await page.evaluate(() => window.meeple.reserver("J6"));

  const mesEmprunts = new PageMesEmprunts(page);
  await mesEmprunts.aller();
  await mesEmprunts.annulerReservation("Pandemic");

  await expect(mesEmprunts.message).toHaveText("Réservation annulée.");
  await expect(mesEmprunts.reservation("Pandemic")).toHaveCount(0);
  await expect(mesEmprunts.aucuneReservation).toBeVisible();
});

test("réservation refusée quand un exemplaire est libre", async ({ page }) => {
  await reinitialiser(page);
  await connecter(page, "testeur@exemple.fr");

  const resultat = await page.evaluate(async () => {
    try {
      await window.meeple.reserver("J6");
      return null;
    } catch (e) {
      return { erreur: e.erreur, message: e.message };
    }
  });

  expect(resultat).toEqual({
    erreur: "exemplaire_disponible",
    message: "Un exemplaire est disponible : empruntez-le.",
  });

  const jeu = new PageJeu(page);
  await jeu.aller("J6");
  await expect(jeu.boutonReserver).toHaveCount(0);
});

test("réservation refusée si le jeu est déjà réservé par le membre", async ({
  page,
}) => {
  await reinitialiser(page);
  await connecter(page, "premium@exemple.fr");
  await page.evaluate(() => window.meeple.emprunter("J6"));
  await page.evaluate(() => window.meeple.reserver("J6"));

  const resultat = await page.evaluate(async () => {
    try {
      await window.meeple.reserver("J6");
      return null;
    } catch (e) {
      return { erreur: e.erreur, message: e.message };
    }
  });

  expect(resultat).toEqual({
    erreur: "deja_reserve",
    message: "Vous avez déjà réservé ce jeu.",
  });
});

test("plafond de deux réservations en attente", async ({ page }) => {
  await reinitialiser(page);

  await connecter(page, "premium@exemple.fr");
  await page.evaluate(async () => {
    await window.meeple.emprunter("J6");
    await window.meeple.emprunter("J7");
  });

  await connecter(page, "testeur@exemple.fr");
  await page.evaluate(async () => {
    await window.meeple.reserver("J6");
    await window.meeple.reserver("J7");
  });

  const resultat = await page.evaluate(async () => {
    try {
      await window.meeple.reserver("J3");
      return null;
    } catch (e) {
      return { erreur: e.erreur, message: e.message };
    }
  });

  expect(resultat).toEqual({
    erreur: "quota_reservations",
    message: "Vous avez déjà 2 réservations en attente.",
  });
});
