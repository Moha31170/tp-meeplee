import { test, expect } from "../utils/fixture.js";
import { reinitialiser } from "../utils/reset.js";
import { PageInscription } from "../pages/pageInscription.js";
import { connecterParFormulaire } from "../utils/auth.js";

test("champs obligatoires", { tag: "@critique" }, async ({ page }) => {
  await reinitialiser(page);
  const inscription = new PageInscription(page);
  await inscription.aller();
  await inscription.valider();

  await expect(inscription.erreurs).toHaveText("Tous les champs sont obligatoires.");
});

test("mot de passe de 7 caractères refusé", { tag: "@critique" }, async ({ page }) => {
  await reinitialiser(page);
  const inscription = new PageInscription(page);
  await inscription.aller();

  await inscription.inscrire({
    prenom: "Test",
    email: "sept@exemple.fr",
    motDePasse: "Abc1234",
  });

  await expect(inscription.erreurs).toHaveText(
    "Le mot de passe doit contenir au moins 8 caractères dont un chiffre.",
  );
});

test("mot de passe sans chiffre refusé", { tag: "@critique" }, async ({ page }) => {
  await reinitialiser(page);
  const inscription = new PageInscription(page);
  await inscription.aller();

  await inscription.inscrire({
    prenom: "Test",
    email: "sanschiffre@exemple.fr",
    motDePasse: "Abcdefgh",
  });

  await expect(inscription.erreurs).toHaveText(
    "Le mot de passe doit contenir au moins 8 caractères dont un chiffre.",
  );
});

test("email existant dans une autre casse refusé", { tag: "@critique" }, async ({ page }) => {
  await reinitialiser(page);
  const inscription = new PageInscription(page);
  await inscription.aller();

  await inscription.inscrire({
    prenom: "Doublon",
    email: "TESTEUR@EXEMPLE.FR",
    motDePasse: "Abcd1234",
  });

  await expect(inscription.erreurs).toHaveText(
    "Cet email est déjà utilisé.",
  );
});

test("inscription valide : message de création", { tag: "@critique" }, async ({ page }) => {
  await reinitialiser(page);
  const inscription = new PageInscription(page);
  await inscription.aller();

  await inscription.inscrire({
    prenom: "Valide",
    email: "valide@exemple.fr",
    motDePasse: "Abcd1234",
  });

  await expect(page.locator("#message")).toContainText(
    "Compte créé, vous pouvez vous connecter.",
  );
});

test("inscription valide premium : le formulaire accepte l'adhésion", { tag: "@critique" }, async ({
  page,
}) => {
  await reinitialiser(page);
  const inscription = new PageInscription(page);
  await inscription.aller();

  await inscription.inscrire({
    prenom: "Premium",
    email: "premium-cree@exemple.fr",
    motDePasse: "Abcd1234",
    premium: true,
  });

  await expect(page.locator("#message")).toContainText(
    "Compte créé, vous pouvez vous connecter.",
  );
});

test("compte créé puis connexion", { tag: "@critique" }, async ({ page }) => {
  await reinitialiser(page);
  const inscription = new PageInscription(page);
  await inscription.aller();

  await inscription.inscrire({
    prenom: "Nouveau",
    email: "nouveau@exemple.fr",
    motDePasse: "Abcd1234",
    premium: true,
  });

  await expect(page.locator("#message")).toHaveText(
    "Compte créé, vous pouvez vous connecter Se connecter",
  );

  await connecterParFormulaire(page, "nouveau@exemple.fr", "Abcd1234");
  await expect(page).toHaveURL(/\/mes-emprunts\.html$/);
  await expect(page.getByText("Nouveau")).toBeVisible();
});
