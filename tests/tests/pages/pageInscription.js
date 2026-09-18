export class PageInscription {
  constructor(page) {
    this.page = page;
    this.champPrenom = page.getByLabel("Prénom");
    this.champEmail = page.getByLabel("Email");
    this.champMotDePasse = page.getByLabel("Mot de passe");
    this.casePremium = page.getByLabel(/Adhésion premium/);
    this.boutonCreer = page.getByRole("button", { name: "Créer mon compte" });
    this.erreurs = page.locator("#erreurs");
  }

  async aller() {
    await this.page.goto("/inscription.html");
  }

  async remplir({ prenom, email, motDePasse, premium = false } = {}) {
    if (prenom !== undefined) await this.champPrenom.fill(prenom);
    if (email !== undefined) await this.champEmail.fill(email);
    if (motDePasse !== undefined) await this.champMotDePasse.fill(motDePasse);
    if (premium) await this.casePremium.check();
  }

  async valider() {
    await this.boutonCreer.click();
  }

  async inscrire(donnees) {
    await this.remplir(donnees);
    await this.valider();
  }
}
