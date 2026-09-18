// =============================================================================
// Configuration Playwright — projet de tests de l'application école Meeple
// -----------------------------------------------------------------------------
// Même structure que le projet Réunio : navigateur, adresse de départ, délais,
// rapports, démarrage de l'application. Deux réglages viennent de
// l'environnement : PORT (défaut 4200) et CI (mode pipeline).
// =============================================================================
import { defineConfig, devices } from '@playwright/test';

// Adresse de l'application école. Le serveur lit la même variable PORT.
const PORT = Number(process.env.PORT) || 4200;
const URL_DE_BASE = `http://localhost:${PORT}`;
// Dossier de l'application, démarrée par Playwright (webServer).
const DOSSIER_APP = process.env.MEEPLE_APP || '../app';
// Vrai sur un runner d'intégration continue (variable CI définie).
const EN_CI = Boolean(process.env.CI);

export default defineConfig({
  // Où se trouvent les tests de bout en bout (fichiers *.spec.js).
  testDir: './tests/e2e',

  // Durée maximale d'UN test, puis d'UNE assertion à attente automatique.
  timeout: 30 * 1000,
  expect: { timeout: 5 * 1000 },

  // Un seul processus en local (console lisible), deux en CI.
  fullyParallel: false,
  workers: EN_CI ? 2 : 1,
  // Aucune nouvelle tentative en local : un échec se lit. Une en CI, signalée « flaky ».
  retries: EN_CI ? 1 : 0,
  // Interdit un test.only oublié lors d'une exécution en intégration continue.
  forbidOnly: EN_CI,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],

  use: {
    // Dans les tests, page.goto('/index.html') suffit.
    baseURL: URL_DE_BASE,
    // Capture conservée uniquement en cas d'échec ; trace à la première reprise.
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    // Langue et fuseau : l'application affiche des dates de Paris.
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris'
  },

  // Le préréglage Desktop Chrome impose sa fenêtre (1280 × 720).
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /11-mobile\.spec\.js/
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      testMatch: /11-mobile\.spec\.js/
    }
  ],

  // Playwright démarre l'application, puis l'arrête à la fin.
  // Si un serveur écoute déjà sur le port, il est réutilisé.
  webServer: {
    command: `node ${DOSSIER_APP}/serveur.js`,
    url: `${URL_DE_BASE}/index.html`,
    reuseExistingServer: true,
    timeout: 30 * 1000
  }
});
