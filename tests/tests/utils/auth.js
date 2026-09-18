// Helpers de session pour les tests : connexion sans passer par le formulaire.
// Meeple garde la session dans le localStorage du navigateur : il suffit d'y
// écrire un jeton et le profil du membre, puis de recharger.

// Profils des comptes de démonstration (mot de passe commun : Test1234!).
export const COMPTES = {
  'testeur@exemple.fr': { id: 'M1', prenom: 'Camille', email: 'testeur@exemple.fr', premium: false },
  'premium@exemple.fr': { id: 'M2', prenom: 'Karim', email: 'premium@exemple.fr', premium: true },
  'standard@exemple.fr': { id: 'M3', prenom: 'Inès', email: 'standard@exemple.fr', premium: false }
};

// Ouvre une page de l'application puis y injecte la session du membre demandé.
export async function connecter(page, email) {
  const membre = COMPTES[email];
  if (!membre) throw new Error(`Compte de démonstration inconnu : ${email}`);
  await page.goto('/index.html');
  await page.evaluate((profil) => {
    localStorage.setItem('meeple.token', `tok_${profil.id}_test`);
    localStorage.setItem('meeple.membre', JSON.stringify(profil));
  }, membre);
  await page.reload();
}

// Connexion réelle par le formulaire (utile pour tester la page Connexion elle-même).
export async function connecterParFormulaire(page, email, motDePasse = 'Test1234!') {
  await page.goto('/connexion.html');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mot de passe').fill(motDePasse);
  await page.getByRole('button', { name: 'Se connecter' }).click();
}
