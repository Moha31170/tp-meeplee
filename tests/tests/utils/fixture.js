import { test as base, expect } from "@playwright/test";
import { connecter, COMPTES } from "./auth.js";
import { reinitialiser } from "./reset.js";
import { PageCatalogue } from "../pages/PageCatalogue.js";

export const test = base.extend({
  email: ["testeur@exemple.fr", { option: true }],

  membreConnecte: async ({ page, email }, use) => {
    if (!COMPTES[email]) {
      throw new Error(`Compte de démonstration inconnu : ${email}`);
    }
    await reinitialiser(page);
    await connecter(page, email);
    await use(COMPTES[email]);
  },

  pageCatalogue: async ({ page }, use) => {
    await reinitialiser(page);
    const catalogue = new PageCatalogue(page);
    await catalogue.aller();
    await use(catalogue);
  },
});

export { expect };
