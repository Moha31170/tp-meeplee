export class PageCatalogue {
  constructor(page) {
    this.page = page;

    this.champRecherche = page.getByRole("searchbox");
    this.filtreJoueurs = page.getByLabel("Nombre de joueurs");
    this.filtreDuree = page.getByLabel("Durée maximale");
    this.message = page.locator("#message");
    this.cartes = page.locator("li.jeu");
    this.nomsAffiches = this.cartes.locator(".nom");
  }

  async aller() {
    await this.page.goto("/index.html");
  }

  carte(nomJeu) {
    return this.cartes.filter({ hasText: nomJeu });
  }

  lienFiche(nomJeu) {
    return this.carte(nomJeu).getByRole("link", { name: nomJeu });
  }

  disponibilite(nomJeu) {
    return this.carte(nomJeu).locator(".disponibilite");
  }

  boutonEmprunter(nomJeu) {
    return this.carte(nomJeu).getByRole("button", { name: "Emprunter" });
  }

  boutonReserver(nomJeu) {
    return this.carte(nomJeu).getByRole("button", { name: "Réserver" });
  }

  async rechercher(texte) {
    await this.champRecherche.fill(texte);
  }

  async filtrerParJoueurs(valeur) {
    await this.filtreJoueurs.selectOption(String(valeur));
  }

  async filtrerParDuree(valeur) {
    await this.filtreDuree.selectOption(String(valeur));
  }

  async emprunter(nomJeu) {
    await this.boutonEmprunter(nomJeu).click();
  }

  async reserver(nomJeu) {
    await this.boutonReserver(nomJeu).click();
  }

  async ouvrirFiche(nomJeu) {
    await this.lienFiche(nomJeu).click();
  }
}
