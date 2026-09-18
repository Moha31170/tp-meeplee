// Exemple de test unitaire node:test : à remplacer par vos oracles.
// Exécution : npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('exemple : 0,50 EUR par jour de retard', () => {
  const penalite = (jours) => Math.round(0.5 * jours * 100) / 100;
  assert.equal(penalite(6), 3);
});
