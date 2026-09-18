// =============================================================================
// ia/commun/ia.js — module commun d'appel à un modèle de langage
// -----------------------------------------------------------------------------
// Un seul point d'entrée : demander({ systeme, utilisateur, json, maxTokens }).
// Le fournisseur est choisi par la variable d'environnement IA_FOURNISSEUR :
//   - mock      (défaut) : simulateur déterministe, sans clé ni réseau ;
//   - anthropic          : API Anthropic par fetch, clé ANTHROPIC_API_KEY ;
//   - ollama             : modèle local servi par Ollama.
// Chaque appel est journalisé dans ia-journal.jsonl avec ses jetons et son coût.
// =============================================================================
import fs from 'node:fs';
import { repondreMock } from './fournisseurs/mock.js';
import { repondreAnthropic } from './fournisseurs/anthropic.js';
import { repondreOllama } from './fournisseurs/ollama.js';

// Tarifs publics de l'API Anthropic, en dollars par million de jetons (septembre 2026).
export const TARIFS_USD_PAR_MILLION = {
  'claude-haiku-4-5': { entree: 1.00, sortie: 5.00 },
  'claude-sonnet-5': { entree: 2.00, sortie: 10.00 },
  'claude-opus-5': { entree: 5.00, sortie: 25.00 }
};

export const MODELE_PAR_DEFAUT = 'claude-haiku-4-5';

const FOURNISSEURS = { mock: repondreMock, anthropic: repondreAnthropic, ollama: repondreOllama };

export function configuration() {
  return {
    fournisseur: process.env.IA_FOURNISSEUR || 'mock',
    modele: process.env.IA_MODELE || MODELE_PAR_DEFAUT,
    journal: process.env.IA_JOURNAL || 'ia-journal.jsonl',
    maxAppels: Number(process.env.IA_MAX_APPELS || 50)
  };
}

export function estimerCoutUSD(modele, jetons) {
  const tarif = TARIFS_USD_PAR_MILLION[modele];
  if (!tarif) return null;
  return Math.round(((jetons.entree * tarif.entree + jetons.sortie * tarif.sortie) / 1_000_000) * 1_000_000) / 1_000_000;
}

// Extrait un objet ou un tableau JSON d'une réponse en texte libre.
export function extraireJSON(texte) {
  const cloture = texte.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidat = cloture ? cloture[1] : texte;
  const debut = Math.min(...['{', '['].map((c) => candidat.indexOf(c)).filter((i) => i >= 0));
  if (!Number.isFinite(debut)) throw new Error('aucun JSON dans la réponse');
  const fin = Math.max(candidat.lastIndexOf('}'), candidat.lastIndexOf(']'));
  return JSON.parse(candidat.slice(debut, fin + 1));
}

export function lireJournal(chemin = configuration().journal) {
  if (!fs.existsSync(chemin)) return [];
  return fs.readFileSync(chemin, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

// Garde-fou de coût : un fournisseur réel refuse de dépasser IA_MAX_APPELS appels.
function verifierPlafond(config) {
  const nombre = lireJournal(config.journal).filter((l) => l.fournisseur !== 'mock').length;
  if (nombre >= config.maxAppels) {
    throw new Error(`Plafond IA_MAX_APPELS atteint (${nombre}/${config.maxAppels} appels réels dans ${config.journal}).`);
  }
}

// L'appel. Renvoie { texte, donnees, jetons, coutUSD, dureeMs, fournisseur, modele, arret }.
export async function demander({ systeme, utilisateur, json = false, maxTokens = 1024, etiquette = 'appel' }) {
  const config = configuration();
  const repondre = FOURNISSEURS[config.fournisseur];
  if (!repondre) throw new Error(`Fournisseur inconnu : ${config.fournisseur} (attendu : mock, anthropic, ollama)`);
  if (config.fournisseur !== 'mock') verifierPlafond(config);

  const debut = Date.now();
  const brut = await repondre({ systeme, utilisateur, json, maxTokens, modele: config.modele });
  const dureeMs = Date.now() - debut;
  const resultat = {
    fournisseur: config.fournisseur,
    modele: brut.modele,
    texte: brut.texte,
    jetons: brut.jetons,
    coutUSD: config.fournisseur === 'anthropic' ? estimerCoutUSD(config.modele, brut.jetons) : 0,
    dureeMs,
    arret: brut.arret,
    donnees: null,
    erreurJSON: null
  };
  if (json) {
    try {
      resultat.donnees = extraireJSON(brut.texte);
    } catch (e) {
      resultat.erreurJSON = e.message;
    }
  }
  fs.appendFileSync(config.journal, JSON.stringify({
    horodatage: new Date().toISOString(), etiquette, fournisseur: resultat.fournisseur, modele: resultat.modele,
    jetons: resultat.jetons, coutUSD: resultat.coutUSD, dureeMs, arret: resultat.arret, jsonValide: json ? resultat.donnees !== null : null
  }) + '\n');
  return resultat;
}

// Bilan d'un journal : appels, jetons et coût par fournisseur.
export function bilan(chemin = configuration().journal) {
  const totaux = {};
  for (const l of lireJournal(chemin)) {
    const t = (totaux[l.fournisseur] ??= { appels: 0, entree: 0, sortie: 0, coutUSD: 0, dureeMs: 0 });
    t.appels += 1;
    t.entree += l.jetons.entree;
    t.sortie += l.jetons.sortie;
    t.coutUSD = Math.round((t.coutUSD + (l.coutUSD || 0)) * 1_000_000) / 1_000_000;
    t.dureeMs += l.dureeMs;
  }
  return totaux;
}
