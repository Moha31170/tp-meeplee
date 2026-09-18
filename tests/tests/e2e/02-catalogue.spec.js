import { test, expect } from "../utils/fixture.js";

test("la liste est triée par nom", { tag: "@etendu" }, async ({ pageCatalogue }) => {
  await expect(pageCatalogue.nomsAffiches).toHaveText([
    "7 Wonders",
    "Azul",
    "Catan",
    "Codenames",
    "Dixit",
    "Les Aventuriers du Rail",
    "Pandemic",
    "Twilight Imperium",
  ]);
});

test("un jeu retiré affiche Indisponible et un bouton Emprunter désactivé, sans bouton Réserver", { tag: "@etendu" }, async ({
  pageCatalogue,
}) => {
  await expect(pageCatalogue.disponibilite("Twilight Imperium")).toHaveText(
    "Indisponible",
  );
  await expect(
    pageCatalogue.boutonEmprunter("Twilight Imperium"),
  ).toBeDisabled();
  await expect(pageCatalogue.boutonReserver("Twilight Imperium")).toHaveCount(
    0,
  );
});

test("les disponibilités affichées correspondent aux exemplaires libres", { tag: "@etendu" }, async ({
  pageCatalogue,
}) => {
  await expect(pageCatalogue.disponibilite("Catan")).toHaveText(
    "Aucun exemplaire disponible",
  );
  await expect(pageCatalogue.boutonReserver("Catan")).toBeVisible();
  await expect(pageCatalogue.boutonEmprunter("Catan")).toHaveCount(0);

  await expect(pageCatalogue.disponibilite("Dixit")).toHaveText(
    "1 exemplaire disponible sur 2",
  );
  await expect(pageCatalogue.boutonEmprunter("Dixit")).toBeVisible();

  await expect(pageCatalogue.disponibilite("Codenames")).toHaveText(
    "3 exemplaires disponibles sur 3",
  );
});

test("filtre « 2 » joueurs : jeux jouables à 2 (2 <= joueurs <= 2)", { tag: "@etendu" }, async ({
  pageCatalogue,
}) => {
  await pageCatalogue.filtrerParJoueurs(2);
  await expect(pageCatalogue.nomsAffiches).toHaveText([
    "7 Wonders",
    "Azul",
    "Codenames",
    "Les Aventuriers du Rail",
    "Pandemic",
  ]);
});

test("filtre « 4 » joueurs : jeux jouables à 4 (RG-CATALOGUE, app/README.md)", { tag: "@etendu" }, async ({
  pageCatalogue,
}) => {
  await pageCatalogue.filtrerParJoueurs(4);

  await expect(pageCatalogue.cartes).toHaveCount(8);
});

test("filtre « 8 » joueurs : Codenames seul (RG-CATALOGUE, app/README.md)", { tag: "@etendu" }, async ({
  pageCatalogue,
}) => {
  await pageCatalogue.filtrerParJoueurs(8);

  await expect(pageCatalogue.nomsAffiches).toHaveText(["Codenames"]);
});

test("filtre durée maximale « 30 min »", { tag: "@etendu" }, async ({ pageCatalogue }) => {
  await pageCatalogue.filtrerParDuree(30);

  await expect(pageCatalogue.nomsAffiches).toHaveText([
    "7 Wonders",
    "Codenames",
    "Dixit",
  ]);
});

test("cumul des filtres joueurs et durée", { tag: "@etendu" }, async ({ pageCatalogue }) => {
  await pageCatalogue.filtrerParJoueurs(2);
  await pageCatalogue.filtrerParDuree(30);

  await expect(pageCatalogue.nomsAffiches).toHaveText([
    "7 Wonders",
    "Codenames",
  ]);
});

test("recherche insensible à la casse", { tag: "@etendu" }, async ({ pageCatalogue }) => {
  await pageCatalogue.rechercher("DIXIT");

  await expect(pageCatalogue.nomsAffiches).toHaveText(["Dixit"]);
});

test("recherche insensible aux accents", { tag: "@etendu" }, async ({ pageCatalogue }) => {
  await pageCatalogue.rechercher("dixît");

  await expect(pageCatalogue.nomsAffiches).toHaveText(["Dixit"]);
});

test("recherche sans résultat affiche le message dédié", { tag: "@etendu" }, async ({
  pageCatalogue,
}) => {
  await pageCatalogue.rechercher("zzzzz");

  await expect(pageCatalogue.message).toHaveText("Aucun jeu ne correspond.");
  await expect(pageCatalogue.cartes).toHaveCount(0);
});
