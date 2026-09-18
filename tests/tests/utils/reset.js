// Remise à zéro des données de l'application école avant un test.
// L'état vit dans le localStorage : on demande à l'application de le recréer.
// Attention : la réinitialisation efface aussi la session ; appeler connecter après.
export async function reinitialiser(page) {
  await page.goto('/index.html');
  await page.evaluate(() => window.meeple.reinitialiser());
}
