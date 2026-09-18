export class PageMesEmprunts {
  constructor(page) {
    this.page = page;
    this.compteur = page.locator("#compteur");
    this.message = page.locator("#message");
    this.lignes = page.locator("#emprunts tbody tr");
    this.reservations = page.locator("#reservations li");
    this.aucuneReservation = page.locator("#aucune-reservation");
    this.boutonDeconnexion = page.getByRole("button", { name: "Déconnexion" });
  }

  async aller() {
    await this.page.goto("/mes-emprunts.html");
  }

  ligne(nomJeu) {
    return this.lignes.filter({ hasText: nomJeu });
  }

  boutonRendre(nomJeu) {
    return this.ligne(nomJeu).getByRole("button", { name: "Rendre" });
  }

  boutonProlonger(nomJeu) {
    return this.ligne(nomJeu).getByRole("button", { name: "Prolonger" });
  }

  reservation(nomJeu) {
    return this.reservations.filter({ hasText: nomJeu });
  }

  boutonAnnulerReservation(nomJeu) {
    return this.reservation(nomJeu).getByRole("button", { name: "Annuler" });
  }

  async rendre(nomJeu) {
    await this.boutonRendre(nomJeu).click();
  }

  async prolonger(nomJeu) {
    await this.boutonProlonger(nomJeu).click();
  }

  async annulerReservation(nomJeu) {
    await this.boutonAnnulerReservation(nomJeu).click();
  }

  async deconnecter() {
    await this.boutonDeconnexion.click();
  }
}
