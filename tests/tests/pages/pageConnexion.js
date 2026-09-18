export class PageConnexion {
  constructor(page) {
    this.page = page;
    this.champEmail = page.getByLabel("Email");
    this.champMotDePasse = page.getByLabel("Mot de passe");
    this.boutonConnexion = page.getByRole("button", { name: "Se connecter" });
    this.alerte = page.getByRole("alert");
    this.lienInscription = page.getByRole("link", { name: "Créer un compte" });
  }

  async aller() {
    await this.page.goto("/connexion.html");
  }

  async remplir(email, motDePasse) {
    await this.champEmail.fill(email);
    await this.champMotDePasse.fill(motDePasse);
  }

  async valider() {
    await this.boutonConnexion.click();
  }

  // Confort pour les cas qui ne dépendent pas d'un ?retour= déjà présent.
  async connecter(email, motDePasse) {
    await this.aller();
    await this.remplir(email, motDePasse);
    await this.valider();
  }
}
