// Premier test de bout en bout : l'application répond et affiche des jeux.
// Exécution : npm run test:e2e   (ou npx playwright test)
import { test, expect } from '@playwright/test';

test('la page Catalogue affiche le titre et au moins un jeu', { tag: "@critique" }, async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.getByRole('heading', { level: 1, name: 'Meeple' })).toBeVisible();
  await expect(page.locator('li.jeu').first()).toBeVisible();
});
