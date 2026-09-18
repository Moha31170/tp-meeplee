import { test, expect } from "../utils/fixture.js";
import { reinitialiser } from "../utils/reset.js";
import { connecter } from "../utils/auth.js";
import { PageMesEmprunts } from "../pages/pageEmprunts.js";
import {
  dateRetourPrevue,
  joursDeRetard,
  penalite,
  formaterDate,
  formaterEuros,
} from "../utils/oracles.js";
import { dateISO, isoDansNJours, INSTANT_FIXE } from "../utils/dates.js";

function isoDepuisAffichage(texte) {
  const [jour, mois, annee] = texte.split("/");
  return `${annee}-${mois}-${jour}`;
}

function instantJour(iso) {
  return new Date(`${iso}T09:00:00Z`);
}

test("rendre Dixit en retard : pénalité calculée depuis la date affichée", async ({
  page,
}) => {
  await reinitialiser(page);
  await connecter(page, "testeur@exemple.fr");
  const mesEmprunts = new PageMesEmprunts(page);
  await mesEmprunts.aller();

  const retourAffiche = await mesEmprunts
    .ligne("Dixit")
    .locator(".date-retour")
    .textContent();
  const retourIso = isoDepuisAffichage(retourAffiche.trim());
  const aujourdHui = dateISO();
  const retard = joursDeRetard(retourIso, aujourdHui);
  const montant = penalite(retard);

  await mesEmprunts.rendre("Dixit");

  await expect(mesEmprunts.message).toHaveText(
    `Jeu rendu avec ${retard} jour(s) de retard : pénalité de ${formaterEuros(montant)}.`,
  );
  await expect(mesEmprunts.ligne("Dixit").locator(".statut")).toHaveText(
    `Rendu le ${formaterDate(aujourdHui)}`,
  );
});

test("prolongation refusée si l'emprunt est en retard", async ({ page }) => {
  await reinitialiser(page);
  await connecter(page, "testeur@exemple.fr");
  const mesEmprunts = new PageMesEmprunts(page);
  await mesEmprunts.aller();

  await mesEmprunts.prolonger("Dixit");
  await expect(mesEmprunts.message).toHaveText(
    "Prolongation impossible : emprunt en retard.",
  );
});

test("prolongation refusée si le jeu est réservé par un autre membre", async ({
  page,
}) => {
  await reinitialiser(page);
  await connecter(page, "premium@exemple.fr");
  await page.evaluate(() => window.meeple.emprunter("J6"));

  await connecter(page, "standard@exemple.fr");
  await page.evaluate(() => window.meeple.reserver("J6"));

  await connecter(page, "premium@exemple.fr");
  const mesEmprunts = new PageMesEmprunts(page);
  await mesEmprunts.aller();

  await mesEmprunts.prolonger("Pandemic");
  await expect(mesEmprunts.message).toHaveText(
    "Prolongation impossible : jeu réservé.",
  );
});

test("prolongation acceptée : nouveau retour calculé depuis l'ancien", async ({
  page,
}) => {
  await reinitialiser(page);
  await connecter(page, "premium@exemple.fr");
  await page.evaluate(() => window.meeple.emprunter("J6"));

  const mesEmprunts = new PageMesEmprunts(page);
  await mesEmprunts.aller();
  const retourAffiche = await mesEmprunts
    .ligne("Pandemic")
    .locator(".date-retour")
    .textContent();
  const retourIso = isoDepuisAffichage(retourAffiche.trim());
  const attenduIso = isoDansNJours(7, new Date(`${retourIso}T09:00:00Z`));

  await mesEmprunts.prolonger("Pandemic");

  await expect(mesEmprunts.message).toHaveText(
    `Prolongation acceptée : nouveau retour le ${formaterDate(attenduIso)}.`,
  );
  await expect(
    mesEmprunts.ligne("Pandemic").locator(".date-retour"),
  ).toHaveText(formaterDate(attenduIso));
});

test("prolongation acceptée puis refusée à la seconde tentative", async ({
  page,
}) => {
  await reinitialiser(page);
  await connecter(page, "premium@exemple.fr");
  await page.evaluate(() => window.meeple.emprunter("J6"));

  const mesEmprunts = new PageMesEmprunts(page);
  await mesEmprunts.aller();
  const retourAvant = await mesEmprunts
    .ligne("Pandemic")
    .locator(".date-retour")
    .textContent();
  const attendu = dateRetourPrevue(
    isoDepuisAffichage(retourAvant.trim()),
    false,
  );
  const retourProlonge = new Date(
    `${isoDepuisAffichage(retourAvant.trim())}T09:00:00Z`,
  );
  const attenduIso = isoDansNJours(7, retourProlonge);

  await mesEmprunts.prolonger("Pandemic");
  await expect(mesEmprunts.message).toHaveText(
    `Prolongation acceptée : nouveau retour le ${formaterDate(attenduIso)}.`,
  );

  await mesEmprunts.prolonger("Pandemic");
  await expect(mesEmprunts.message).toHaveText(
    "Prolongation impossible : déjà prolongé.",
  );
});

test("rendu le jour du retour prévu : aucun retard", async ({ page }) => {
  await page.clock.setFixedTime(INSTANT_FIXE);
  await reinitialiser(page);
  await connecter(page, "standard@exemple.fr");

  await page.goto("/jeu.html?id=J6");
  await page.getByRole("button", { name: "Emprunter" }).click();

  const mesEmprunts = new PageMesEmprunts(page);
  await mesEmprunts.aller();
  const retourAffiche = await mesEmprunts
    .ligne("Pandemic")
    .locator(".date-retour")
    .textContent();
  const retourIso = isoDepuisAffichage(retourAffiche.trim());

  await page.clock.setFixedTime(instantJour(retourIso));
  await mesEmprunts.rendre("Pandemic");

  await expect(mesEmprunts.message).toHaveText("Jeu rendu, merci !");
});

test("plus de vingt jours de retard : pénalité calculée par l'oracle", async ({
  page,
}) => {
  await page.clock.setFixedTime(INSTANT_FIXE);
  await reinitialiser(page);
  await connecter(page, "standard@exemple.fr");

  await page.goto("/jeu.html?id=J6");
  await page.getByRole("button", { name: "Emprunter" }).click();

  const mesEmprunts = new PageMesEmprunts(page);
  await mesEmprunts.aller();
  const retourAffiche = await mesEmprunts
    .ligne("Pandemic")
    .locator(".date-retour")
    .textContent();
  const retourIso = isoDepuisAffichage(retourAffiche.trim());
  const dateRenduIso = isoDansNJours(21, new Date(`${retourIso}T09:00:00Z`));
  const dateRendu = instantJour(dateRenduIso);
  const retard = joursDeRetard(retourIso, isoDansNJours(21, new Date(`${retourIso}T09:00:00Z`)));
  const montant = penalite(retard);

  await page.clock.setFixedTime(dateRendu);
  await mesEmprunts.rendre("Pandemic");

  await expect(mesEmprunts.message).toHaveText(
    `Jeu rendu avec ${retard} jour(s) de retard : pénalité de ${formaterEuros(montant)}.`,
  );
});
