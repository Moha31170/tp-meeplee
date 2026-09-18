import { test, expect } from "@playwright/test";

test("poids — mesure puis respecte le budget", { tag: "@etendu" }, async ({ page }) => {
  const lectures = [];

  page.on("response", (response) => {
    // On ne compte que les réponses HTTP de la page, et on lit le corps
    // pour mesurer les octets réellement reçus sans dépendre de Content-Length.
    if (!response.url().startsWith("http")) return;
    lectures.push(
      response.body()
        .then((body) => body.byteLength)
        .catch(() => 0),
    );
  });

  await page.goto("/index.html", { waitUntil: "load" });
  const octetsRecus = (await Promise.all(lectures)).reduce(
    (total, octets) => total + octets,
    0,
  );
  const nombreReponses = lectures.length;

  const navigation = await page.evaluate(() => {
    const entree = performance.getEntriesByType("navigation")[0];
    return {
      loadEventEnd: entree?.loadEventEnd ?? 0,
    };
  });

  console.log(
    `[poids] réponses=${nombreReponses} | octets=${octetsRecus} | loadEventEnd=${navigation.loadEventEnd.toFixed(1)} ms`,
  );

  // Mesure observée sur le projet : 9 réponses et ~27,3 ko.
  // Budgets volontairement arrondis juste au-dessus de la mesure.
  const BUDGET_REPONSES = 10;
  const BUDGET_OCTETS = 30_000;
  const BUDGET_LOAD_EVENT_END_MS = 2_000;

  expect(nombreReponses).toBeLessThanOrEqual(BUDGET_REPONSES);
  expect(octetsRecus).toBeLessThanOrEqual(BUDGET_OCTETS);
  expect(navigation.loadEventEnd).toBeLessThanOrEqual(BUDGET_LOAD_EVENT_END_MS);
});
