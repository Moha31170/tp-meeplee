/**
 * Simule une latence réseau sur les requêtes correspondant au motif fourni.
 *
 * @param {import('@playwright/test').Page} page
 * @param {number} ms durée de la latence en millisecondes
 * @param {string|RegExp} urlPattern motif des requêtes à ralentir
 */
export async function simulerLatence(page, ms, urlPattern = "**/donnees/**") {
  if (!Number.isFinite(ms) || ms < 0) {
    throw new Error("La latence doit être un nombre positif ou nul.");
  }

  await page.route(urlPattern, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
    await route.continue();
  });
}
