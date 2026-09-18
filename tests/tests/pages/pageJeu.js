export class PageJeu {
  constructor(page) {
    this.page = page;
    this.titre = page.locator("#titre");
    this.disponibilite = page.locator("#disponibilite");
    this.retourPrevu = page.locator("#retour-prevu");
    this.message = page.locator("#message");
    this.boutonEmprunter = page.getByRole("button", { name: "Emprunter" });
    this.boutonReserver = page.getByRole("button", { name: "Réserver" });
    this.lienCatalogue = page.getByRole("link", {
      name: "Retour au catalogue",
    });
  }

  async aller(id) {
    await this.page.goto(`/jeu.html?id=${id}`);
  }

  async emprunter() {
    await this.boutonEmprunter.click();
  }

  async reserver() {
    await this.boutonReserver.click();
  }
}
