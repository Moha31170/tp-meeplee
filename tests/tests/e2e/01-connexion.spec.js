import { test, expect } from "../utils/fixtures.js";
import { reinitialiser } from "../utils/reset.js";
import { PageConnexion } from "../pages/pageConnexion.js";
import { PageJeu } from "../pages/pageJeu.js";
import { PageMesEmprunts } from "../pages/PageMesEmprunts.js";

test("Camille se connecte par le formulaire et arrive sur Mes emprunts", async ({
  page,
}) => {
  await reinitialiser(page);
  const connexion = new PageConnexion(page);
  await connexion.connecter("testeur@exemple.fr", "Test1234!");

  await expect(page).toHaveURL(/\/mes-emprunts\.html$/);
  await expect(page.getByText("Camille")).toBeVisible();
  const mesEmprunts = new PageMesEmprunts(page);
  await expect(mesEmprunts.compteur).toHaveText("2 emprunts en cours sur 2");
});

test("email inconnu puis mauvais mot de passe : message exact, champ vidé, adresse inchangée", async ({
  page,
}) => {
  await reinitialiser(page);
  const connexion = new PageConnexion(page);
  await connexion.aller();

  await connexion.remplir("personne@exemple.fr", "Test1234!");
  await connexion.valider();

  await expect(connexion.alerte).toHaveText("Identifiants invalides.");
  await expect(connexion.champMotDePasse).toHaveValue("");
  await expect(page).toHaveURL(/\/connexion\.html$/);

  await connexion.remplir("testeur@exemple.fr", "MauvaisMotDePasse1");
  await connexion.valider();

  await expect(connexion.alerte).toHaveText("Identifiants invalides.");
  await expect(connexion.champMotDePasse).toHaveValue("");
  await expect(page).toHaveURL(/\/connexion\.html$/);
});

test("un visiteur qui clique sur Réserver est renvoyé vers la connexion puis revient sur la fiche", async ({
  page,
}) => {
  await reinitialiser(page);
  const jeu = new PageJeu(page);

  await jeu.aller("J1");
  await jeu.reserver();

  await expect(page).toHaveURL(/\/connexion\.html\?retour=/);

  const connexion = new PageConnexion(page);
  await connexion.remplir("premium@exemple.fr", "Test1234!");
  await connexion.valider();

  await expect(page).toHaveURL(/\/jeu\.html\?id=J1$/);
});

test("la déconnexion renvoie au catalogue", async ({
  page,
  membreConnecte,
}) => {
  const mesEmprunts = new PageMesEmprunts(page);
  await mesEmprunts.aller();
  await mesEmprunts.deconnecter();

  await expect(page).toHaveURL(/\/index\.html$/);
});
