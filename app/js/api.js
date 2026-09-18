// Façade de données de Meeple : joue le rôle d'une API.
// Lecture : fichiers JSON chargés par fetch. Écriture : localStorage du navigateur.
// Chaque fonction renvoie une promesse et rejette avec { erreur, message }.
import { aujourdhuiISO, ajouterJours } from './dates.js';
import { dateRetourPrevue, joursDeRetard, penalite, quotaEmprunts, refusProlongation, QUOTA_RESERVATIONS, PROLONGATION_JOURS } from './regles.js';
import { creerEtatInitial } from './donnees.js';

const CLE_TOKEN = 'meeple.token';
const CLE_MEMBRE = 'meeple.membre';
const CLE_EMPRUNTS = 'meeple.emprunts';
const CLE_RESERVATIONS = 'meeple.reservations';
const CLE_MEMBRES_CREES = 'meeple.membres-crees';

const MESSAGES_REFUS = {
  deja_prolonge: 'Prolongation impossible : déjà prolongé.',
  en_retard: 'Prolongation impossible : emprunt en retard.',
  jeu_reserve: 'Prolongation impossible : jeu réservé.'
};

function erreur(code, message) {
  return Object.assign(new Error(message), { erreur: code, message });
}

function lire(cle, defaut) {
  const brut = localStorage.getItem(cle);
  return brut === null ? defaut : JSON.parse(brut);
}

function ecrire(cle, valeur) {
  localStorage.setItem(cle, JSON.stringify(valeur));
}

// Emprunts et réservations de tous les membres. Créés au premier accès.
function etat() {
  const emprunts = lire(CLE_EMPRUNTS, null);
  const reservations = lire(CLE_RESERVATIONS, null);
  if (emprunts === null || reservations === null) {
    const initial = creerEtatInitial(aujourdhuiISO());
    ecrire(CLE_EMPRUNTS, initial.emprunts);
    ecrire(CLE_RESERVATIONS, initial.reservations);
    return initial;
  }
  return { emprunts, reservations };
}

function sauver({ emprunts, reservations }) {
  ecrire(CLE_EMPRUNTS, emprunts);
  ecrire(CLE_RESERVATIONS, reservations);
}

// ----- Session -----

export function membreConnecte() {
  return localStorage.getItem(CLE_TOKEN) ? lire(CLE_MEMBRE, null) : null;
}

function exigerConnexion() {
  const membre = membreConnecte();
  if (!membre) throw erreur('non_authentifie', 'Connexion requise.');
  return membre;
}

async function chargerJSON(chemin) {
  const reponse = await fetch(chemin);
  if (!reponse.ok) throw erreur('chargement_impossible', `Chargement impossible (${reponse.status}).`);
  return reponse.json();
}

async function tousLesMembres() {
  const references = await chargerJSON('./donnees/membres.json');
  return references.concat(lire(CLE_MEMBRES_CREES, []));
}

export async function connexion(email, password) {
  if (!email || !password) throw erreur('champs_requis', 'Email et mot de passe sont obligatoires.');
  const membres = await tousLesMembres();
  const membre = membres.find((m) => m.email.toLowerCase() === email.trim().toLowerCase());
  if (!membre || membre.password !== password) {
    throw erreur('identifiants_invalides', 'Identifiants invalides.');
  }
  const token = `tok_${membre.id}_${Math.random().toString(36).slice(2, 10)}`;
  const profil = { id: membre.id, prenom: membre.prenom, email: membre.email, premium: membre.premium };
  localStorage.setItem(CLE_TOKEN, token);
  ecrire(CLE_MEMBRE, profil);
  return { token, membre: profil };
}

export async function deconnexion() {
  localStorage.removeItem(CLE_TOKEN);
  localStorage.removeItem(CLE_MEMBRE);
}

export async function inscription({ prenom, email, password, premium = false }) {
  if (!prenom || !email || !password) {
    throw erreur('champs_requis', 'Tous les champs sont obligatoires.');
  }
  if (password.length < 8 || !/[0-9]/.test(password)) {
    throw erreur('mot_de_passe_faible', 'Le mot de passe doit contenir au moins 8 caractères dont un chiffre.');
  }
  const membres = await tousLesMembres();
  if (membres.some((m) => m.email === email.trim())) {
    throw erreur('email_deja_utilise', 'Cet email est déjà utilisé.');
  }
  const crees = lire(CLE_MEMBRES_CREES, []);
  const membre = { id: `M${membres.length + 1}`, prenom, email: email.trim(), premium: Boolean(premium), password };
  crees.push(membre);
  ecrire(CLE_MEMBRES_CREES, crees);
  const { password: _mdp, ...profil } = membre;
  return profil;
}

// ----- Catalogue -----

function sansAccents(texte) {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function exemplairesDisponibles(jeu, emprunts) {
  const sortis = emprunts.filter((e) => e.jeuId === jeu.id && e.statut === 'en_cours').length;
  return Math.max(0, jeu.exemplaires - sortis);
}

function enrichir(jeu, emprunts) {
  return { ...jeu, disponibles: jeu.statut === 'disponible' ? exemplairesDisponibles(jeu, emprunts) : 0 };
}

export async function chargerJeux({ joueurs = 0, dureeMax = 0, recherche = '' } = {}) {
  const jeux = await chargerJSON('./donnees/jeux.json');
  const { emprunts } = etat();
  const nombre = Number(joueurs) || 0;
  const duree = Number(dureeMax) || 0;
  const motif = sansAccents(recherche.trim());
  return jeux
    .filter((j) => !nombre || (j.joueursMin <= nombre && j.joueursMax > nombre))
    .filter((j) => !duree || j.dureeMinutes <= duree)
    .filter((j) => !motif || sansAccents(j.nom).includes(motif))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
    .map((j) => enrichir(j, emprunts));
}

export async function chargerJeu(id) {
  const jeux = await chargerJSON('./donnees/jeux.json');
  const jeu = jeux.find((j) => j.id === id);
  if (!jeu) throw erreur('jeu_inconnu', 'Jeu inconnu.');
  return enrichir(jeu, etat().emprunts);
}

// ----- Emprunts du membre -----

function mesEmpruntsEnCours(membre, emprunts) {
  return emprunts.filter((e) => e.membreId === membre.id && e.statut === 'en_cours');
}

export async function emprunter(jeuId) {
  const membre = exigerConnexion();
  const jeu = await chargerJeu(jeuId);
  const donnees = etat();
  if (jeu.statut !== 'disponible') throw erreur('jeu_indisponible', 'Jeu indisponible.');
  const enCours = mesEmpruntsEnCours(membre, donnees.emprunts);
  if (enCours.some((e) => e.jeuId === jeuId)) throw erreur('deja_emprunte', 'Vous avez déjà ce jeu.');
  const quota = quotaEmprunts(membre.premium);
  if (enCours.length >= quota) throw erreur('quota_atteint', `Vous avez déjà ${quota} emprunts en cours.`);
  if (jeu.disponibles <= 0) throw erreur('aucun_exemplaire', 'Aucun exemplaire disponible : réservez-le.');
  const aujourdhui = aujourdhuiISO();
  const nouvel = {
    id: `E${donnees.emprunts.length + 1}`,
    membreId: membre.id,
    jeuId,
    jeu: { id: jeu.id, nom: jeu.nom },
    dateEmprunt: aujourdhui,
    dateRetourPrevue: dateRetourPrevue(aujourdhui, membre.premium),
    prolonge: false,
    statut: 'en_cours',
    dateRendu: null,
    joursRetard: 0,
    penalite: 0
  };
  donnees.emprunts.push(nouvel);
  // Une réservation du membre sur ce jeu est satisfaite par l'emprunt.
  for (const r of donnees.reservations) {
    if (r.membreId === membre.id && r.jeuId === jeuId && r.statut === 'en_attente') r.statut = 'satisfaite';
  }
  sauver(donnees);
  return nouvel;
}

function trouverMonEmprunt(membre, donnees, id) {
  const emprunt = donnees.emprunts.find((e) => e.id === id);
  if (!emprunt) throw erreur('emprunt_inconnu', 'Emprunt inconnu.');
  if (emprunt.membreId !== membre.id) throw erreur('acces_refuse', 'Accès refusé.');
  if (emprunt.statut !== 'en_cours') throw erreur('deja_rendu', 'Emprunt déjà rendu.');
  return emprunt;
}

export async function rendre(id) {
  const membre = exigerConnexion();
  const donnees = etat();
  const emprunt = trouverMonEmprunt(membre, donnees, id);
  const aujourdhui = aujourdhuiISO();
  emprunt.joursRetard = joursDeRetard(emprunt.dateRetourPrevue, aujourdhui);
  emprunt.penalite = penalite(emprunt.joursRetard);
  emprunt.statut = 'rendu';
  emprunt.dateRendu = aujourdhui;
  sauver(donnees);
  return { id, joursRetard: emprunt.joursRetard, penalite: emprunt.penalite };
}

export async function prolonger(id) {
  const membre = exigerConnexion();
  const donnees = etat();
  const emprunt = trouverMonEmprunt(membre, donnees, id);
  const reserveParUnAutre = donnees.reservations.some(
    (r) => r.jeuId === emprunt.jeuId && r.statut === 'en_attente' && r.membreId === membre.id
  );
  const refus = refusProlongation({
    prolonge: emprunt.prolonge,
    joursRetard: joursDeRetard(emprunt.dateRetourPrevue, aujourdhuiISO()),
    reserveParUnAutre
  });
  if (refus) throw erreur(refus, MESSAGES_REFUS[refus]);
  emprunt.dateRetourPrevue = ajouterJours(emprunt.dateRetourPrevue, PROLONGATION_JOURS);
  emprunt.prolonge = true;
  sauver(donnees);
  return { id, dateRetourPrevue: emprunt.dateRetourPrevue };
}

export async function mesEmprunts() {
  const membre = exigerConnexion();
  const aujourdhui = aujourdhuiISO();
  return etat().emprunts
    .filter((e) => e.membreId === membre.id)
    .map((e) => (e.statut === 'en_cours'
      ? { ...e, joursRetard: joursDeRetard(e.dateRetourPrevue, aujourdhui), penalite: penalite(joursDeRetard(e.dateRetourPrevue, aujourdhui)) }
      : e))
    .sort((a, b) => a.dateEmprunt.localeCompare(b.dateEmprunt) || a.id.localeCompare(b.id));
}

// ----- Réservations du membre -----

function rangDansLaFile(reservations, reservation) {
  return reservations
    .filter((r) => r.jeuId === reservation.jeuId && r.statut === 'en_attente')
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
    .findIndex((r) => r.id === reservation.id) + 1;
}

export async function reserver(jeuId) {
  const membre = exigerConnexion();
  const jeu = await chargerJeu(jeuId);
  const donnees = etat();
  if (jeu.statut !== 'disponible') throw erreur('jeu_indisponible', 'Jeu indisponible.');
  if (jeu.disponibles > 0) throw erreur('exemplaire_disponible', 'Un exemplaire est disponible : empruntez-le.');
  if (mesEmpruntsEnCours(membre, donnees.emprunts).some((e) => e.jeuId === jeuId)) {
    throw erreur('deja_emprunte', 'Vous avez déjà ce jeu.');
  }
  const lesMiennes = donnees.reservations.filter((r) => r.membreId === membre.id && r.statut === 'en_attente');
  if (lesMiennes.some((r) => r.jeuId === jeuId)) throw erreur('deja_reserve', 'Vous avez déjà réservé ce jeu.');
  if (lesMiennes.length >= QUOTA_RESERVATIONS) {
    throw erreur('quota_reservations', `Vous avez déjà ${QUOTA_RESERVATIONS} réservations en attente.`);
  }
  const reservation = {
    id: `R${donnees.reservations.length + 1}`,
    membreId: membre.id,
    jeuId,
    jeu: { id: jeu.id, nom: jeu.nom },
    date: aujourdhuiISO(),
    statut: 'en_attente'
  };
  donnees.reservations.push(reservation);
  sauver(donnees);
  return { ...reservation, rang: rangDansLaFile(donnees.reservations, reservation) };
}

export async function annulerReservation(id) {
  const membre = exigerConnexion();
  const donnees = etat();
  const reservation = donnees.reservations.find((r) => r.id === id);
  if (!reservation) throw erreur('reservation_inconnue', 'Réservation inconnue.');
  if (reservation.membreId !== membre.id) throw erreur('acces_refuse', 'Accès refusé.');
  if (reservation.statut !== 'en_attente') throw erreur('deja_annulee', 'Réservation déjà annulée.');
  reservation.statut = 'annulee';
  sauver(donnees);
  return { id, statut: 'annulee' };
}

export async function mesReservations() {
  const membre = exigerConnexion();
  const { reservations } = etat();
  return reservations
    .filter((r) => r.membreId === membre.id && r.statut === 'en_attente')
    .map((r) => ({ ...r, rang: rangDansLaFile(reservations, r) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ----- Réinitialisation (pour les tests) -----

export async function reinitialiser() {
  localStorage.clear();
  etat();
}
