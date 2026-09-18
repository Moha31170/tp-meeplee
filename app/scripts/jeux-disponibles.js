#!/usr/bin/env node
// Lit donnees/jeux.json sur l'application en cours d'exécution (fetch, pas le
// système de fichiers) et affiche les jeux empruntables — c'est-à-dire non
// retirés — en tableau. Variable PORT respectée (défaut 4200).
// Usage : node scripts/jeux-disponibles.js

const PORT = Number(process.env.PORT) || 4200;
const URL_DE_BASE = `http://localhost:${PORT}`;

const reponse = await fetch(`${URL_DE_BASE}/donnees/jeux.json`);
if (!reponse.ok) {
  console.error(`Impossible de lire donnees/jeux.json (${reponse.status}). L'application est-elle lancée sur ${URL_DE_BASE} ?`);
  process.exit(1);
}
const jeux = await reponse.json();

const empruntables = jeux
  .filter((jeu) => jeu.statut === 'disponible')
  .map((jeu) => ({
    id: jeu.id,
    nom: jeu.nom,
    joueurs: `${jeu.joueursMin} à ${jeu.joueursMax}`,
    duree: `${jeu.dureeMinutes} min`,
    categorie: jeu.categorie,
    exemplaires: jeu.exemplaires
  }));

console.log(`${empruntables.length} jeu(x) empruntable(s) sur ${jeux.length} au catalogue :\n`);
console.table(empruntables);
