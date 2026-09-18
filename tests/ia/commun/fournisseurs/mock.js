// =============================================================================
// Fournisseur simulé : reproductible, sans clé ni réseau.
// Il reconnaît la tâche à des mots-clés du prompt système et fabrique une
// réponse plausible À PARTIR DES DONNÉES DU PROMPT. Il ne « comprend » rien :
// c'est un simulateur pour la salle. Il fait exprès une erreur à la première
// génération de membres, pour que la boucle de validation ait quelque chose à corriger.
// =============================================================================
export function estimerJetons(texte) {
  return Math.ceil(texte.length / 4);
}

export async function repondreMock({ systeme, utilisateur }) {
  const texte = fabriquer(systeme, utilisateur);
  return {
    texte,
    jetons: { entree: estimerJetons(systeme + utilisateur), sortie: estimerJetons(texte), estimes: true },
    arret: 'end_turn',
    modele: 'simule'
  };
}

function fabriquer(systeme, utilisateur) {
  if (/tâche : triage/i.test(systeme)) return JSON.stringify(trier(utilisateur), null, 2);
  if (/tâche : génération de demandes d'inscription/i.test(systeme)) return JSON.stringify(genererMembres(utilisateur), null, 2);
  return `Réponse simulée (fournisseur mock) à : « ${utilisateur.slice(0, 120)} »`;
}

function blocJSON(texte) {
  const m = texte.match(/```json\s*([\s\S]*?)```/);
  return m ? JSON.parse(m[1]) : null;
}

function racines(texte) {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .split(/[^a-z0-9]+/).filter((m) => m.length >= 4).map((m) => m.slice(0, 4));
}

function score(a, b) {
  const ensemble = new Set(racines(b));
  return racines(a).filter((r) => ensemble.has(r)).length;
}

// ----- Triage d'un échec (règles simples sur le message) -----

function trier(utilisateur) {
  const echec = blocJSON(utilisateur) || {};
  const message = echec.message || '';
  const expected = (message.match(/Expected(?: substring)?:\s*(.+)/) || [])[1]?.trim() ?? null;
  const received = (message.match(/Received(?: string)?:\s*(.+)/) || [])[1]?.trim() ?? null;

  let classification = 'anomalie_probable';
  let confiance = 0.6;
  let justification = 'L\'assertion compare une valeur reçue à une valeur attendue par la spécification : l\'application a répondu, mais pas ce que la règle impose.';
  if (/ECONNREFUSED|net::ERR|EADDRINUSE|Executable doesn't exist|browserType\.launch|webServer|Target (page|browser|context)[^\n]*closed/i.test(message)) {
    classification = 'environnement';
    confiance = 0.8;
    justification = 'Le message décrit un navigateur ou un serveur indisponible, pas un comportement de l\'application.';
  } else if (/strict mode violation|Test timeout of \d+ms exceeded|locator\.(click|fill|selectOption): Timeout|element\(s\) not found|waitForTimeout|snapshot doesn't exist/i.test(message)) {
    classification = 'test_fragile';
    confiance = 0.7;
    justification = 'Le test n\'a pas atteint son assertion, ou sa référence manque : à corriger côté test avant de conclure.';
  } else if (received === '""') {
    confiance = 0.5;
    justification = 'La valeur reçue est vide : l\'état attendu n\'a jamais été rendu. Anomalie probable, à confirmer à la main.';
  } else if (expected && received) {
    confiance = 0.75;
  }

  const regles = (utilisateur.match(/^- (RG-[A-Z]+|États[^:]*|Accessibilité[^:]*|Rendu mobile[^:]*) : .+$/gm) || []);
  const pages = (utilisateur.match(/^- Page ([^:]+) : (\S+)/gm) || []);
  const sujet = `${echec.titre || ''} ${echec.fichier || ''} ${message}`;
  const meilleure = (liste) => liste.map((l) => ({ l, s: score(sujet, l) })).sort((a, b) => b.s - a.s)[0]?.l ?? null;
  const regle = meilleure(regles);
  const page = meilleure(pages);
  const nomRegle = regle ? regle.replace(/^- /, '').split(' : ')[0] : 'règle à préciser';
  const nomPage = page ? page.replace(/^- Page /, '').replace(' : ', ' (') + ')' : 'page à préciser';
  const severite = classification !== 'anomalie_probable' ? 'Mineure'
    : /EUR|pénalité|quota|prolong|emprunt|réserv/i.test(sujet) ? 'Majeure' : 'Mineure';

  return {
    classification,
    confiance,
    justification,
    fiche: {
      resume: `${echec.titre || 'Échec'} : ${received ? `l'application affiche ${received}` : 'le résultat observé ne correspond pas à la règle'} (${nomRegle}).`,
      page: nomPage,
      preConditions: `Application école démarrée, jeu de données réinitialisé ; projet ${echec.projet || 'chromium'} ; état préparé par le test ${echec.fichier || ''}.`,
      etapes: [
        `Rejouer le test « ${echec.titre || ''} » (${echec.fichier || ''}:${echec.ligne || ''}).`,
        'Observer la valeur reçue au point d\'assertion.',
        'Comparer à la spécification (règle citée ci-dessous).'
      ],
      observe: received || message.split('\n')[0],
      attenduEtRegle: `${expected || 'valeur conforme à la règle'} — ${regle ? regle.replace(/^- /, '') : nomRegle}`,
      preuve: `${echec.fichier || ''}:${echec.ligne || ''} ; message : ${message.split('\n')[0]}`,
      severite
    }
  };
}

// ----- Génération de demandes d'inscription (gabarit) -----

function genererMembres(utilisateur) {
  const nombre = Number((utilisateur.match(/exactement (\d+) demandes/i) || [])[1] || 10);
  const corriger = /Erreurs de la tentative précédente/i.test(utilisateur);
  const gabarits = [
    { prenom: 'Léa', email: 'lea@exemple.fr', motDePasse: 'Secret123', premium: false, attendu: 'valide', motif: 'cas nominal, adhésion standard' },
    { prenom: 'Noah', email: 'noah@exemple.fr', motDePasse: 'Azerty12', premium: true, attendu: 'valide', motif: 'cas nominal, adhésion premium' },
    { prenom: 'Emma', email: 'emma@exemple.fr', motDePasse: 'Abcdefg1', premium: false, attendu: 'valide', motif: 'mot de passe de 8 caractères exactement (borne)' },
    { prenom: 'Lucas', email: 'lucas@exemple.fr', motDePasse: 'Abcdef1', premium: false, attendu: 'mot_de_passe_faible', motif: '7 caractères, sous la borne' },
    { prenom: 'Chloé', email: 'chloe@exemple.fr', motDePasse: 'abcdefgh', premium: false, attendu: 'mot_de_passe_faible', motif: '8 caractères sans chiffre' },
    { prenom: 'Hugo', email: 'TESTEUR@exemple.fr', motDePasse: 'Secret123', premium: false, attendu: 'email_deja_utilise', motif: 'email existant, en majuscules' },
    { prenom: 'Inès', email: 'standard@exemple.fr', motDePasse: 'Secret123', premium: false, attendu: 'email_deja_utilise', motif: 'email existant à l\'identique' },
    { prenom: '', email: 'sans-prenom@exemple.fr', motDePasse: 'Secret123', premium: false, attendu: 'champs_requis', motif: 'prénom vide' },
    { prenom: 'Yanis', email: 'yanis@exemple.fr', motDePasse: '', premium: false, attendu: 'champs_requis', motif: 'mot de passe vide' },
    { prenom: 'Léa', email: 'Lea@exemple.fr', motDePasse: 'Secret123', premium: false, attendu: 'email_deja_utilise', motif: 'doublon interne : email de la demande 1, casse différente' }
  ];
  const demandes = [];
  for (let i = 0; i < nombre; i += 1) {
    const g = gabarits[i] || { prenom: `Membre${i + 1}`, email: `membre${i + 1}@exemple.fr`, motDePasse: 'Secret123', premium: false, attendu: 'valide', motif: 'cas nominal supplémentaire' };
    // Défaut volontaire du simulateur à la première tentative : le doublon interne est annoncé valide.
    const attendu = (!corriger && i === 9) ? 'valide' : g.attendu;
    demandes.push({ id: `INS-${String(i + 1).padStart(2, '0')}`, ...g, attendu });
  }
  return demandes;
}
