import { test, expect } from "../utils/fixture.js";
import { reinitialiser } from "../utils/reset.js";
import { PageJeu } from "../pages/pageJeu.js";
import { dateRetourPrevue, formaterDate } from "../utils/oracles.js";
import { dateISO } from "../utils/dates.js";

test("fiche Codenames : caractéristiques et date de retour", { tag: "@etendu" }, async ({ page }) => {
  await reinitialiser(page);
  const jeu = new PageJeu(page);
  await jeu.aller("J5");

  const retourAttendu = dateRetourPrevue(dateISO(), false);

  await expect(jeu.titre).toHaveText("Codenames");
  await expect(jeu.joueurs).toHaveText("2 à 8 joueurs");
  await expect(jeu.duree).toHaveText("15 min");
  await expect(jeu.age).toHaveText("Dès 14 ans");
  await expect(jeu.categorie).toHaveText("ambiance");
  await expect(jeu.disponibilite).toHaveText("3 exemplaires disponibles sur 3");
  await expect(jeu.retourPrevu).toHaveText(formaterDate(retourAttendu));
  await expect(jeu.boutonEmprunter).toBeVisible();
  await expect(jeu.boutonReserver).toHaveCount(0);
  await expect(jeu.lienCatalogue).toBeVisible();
});

test("fiche d'un jeu retiré : message et actions indisponibles", { tag: "@etendu" }, async ({ page }) => {
  await reinitialiser(page);
  const jeu = new PageJeu(page);
  await jeu.aller("J8");

  await expect(jeu.titre).toHaveText("Twilight Imperium");
  await expect(jeu.joueurs).toHaveText("3 à 6 joueurs");
  await expect(jeu.duree).toHaveText("480 min");
  await expect(jeu.age).toHaveText("Dès 14 ans");
  await expect(jeu.categorie).toHaveText("stratégie");
  await expect(jeu.disponibilite).toHaveText("Indisponible");
  await expect(jeu.message).toHaveText("Jeu indisponible.");
  await expect(jeu.boutonEmprunter).toHaveCount(0);
  await expect(jeu.boutonReserver).toHaveCount(0);
  await expect(jeu.fiche).toBeVisible();
  await expect(jeu.chargement).toBeHidden();
});

test("fiche avec identifiant inconnu : message exact", { tag: "@etendu" }, async ({ page }) => {
  await reinitialiser(page);
  const jeu = new PageJeu(page);
  await jeu.aller("J999");

  await expect(jeu.message).toHaveText("Jeu inconnu.");
  await expect(jeu.fiche).toBeHidden();
  await expect(jeu.chargement).toBeHidden();
  await expect(jeu.boutonEmprunter).toHaveCount(0);
  await expect(jeu.boutonReserver).toHaveCount(0);
});
