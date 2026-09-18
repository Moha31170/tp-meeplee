// Page Mes emprunts : tableau, compteur, retour, prolongation, réservations.
import * as api from '../api.js';
import { formaterDate } from '../dates.js';
import { formaterEuros } from '../regles.js';
import { afficherMessage, exigerSession } from '../session.js';

const membre = exigerSession('/mes-emprunts.html');

const corps = document.querySelector('#emprunts tbody');
const compteur = document.querySelector('#compteur');
const listeReservations = document.querySelector('#reservations');
const aucuneReservation = document.querySelector('#aucune-reservation');

function libelleStatut(e) {
  if (e.statut === 'rendu') return `Rendu le ${formaterDate(e.dateRendu)}`;
  if (e.joursRetard > 0) return `En retard de ${e.joursRetard} jour(s)`;
  return 'En cours';
}

function libellePenalite(e) {
  return e.penalite > 0 ? formaterEuros(e.penalite) : '—';
}

function rendreLigne(e) {
  const ligne = document.createElement('tr');
  ligne.dataset.empruntId = e.id;
  ligne.innerHTML = `
    <td class="jeu">${e.jeu.nom}</td>
    <td class="date-emprunt">${formaterDate(e.dateEmprunt)}</td>
    <td class="date-retour">${formaterDate(e.dateRetourPrevue)}</td>
    <td class="statut ${e.statut === 'en_cours' && e.joursRetard > 0 ? 'retard' : ''}">${libelleStatut(e)}</td>
    <td class="penalite">${libellePenalite(e)}</td>
    <td class="actions"></td>
  `;
  if (e.statut === 'en_cours') {
    const rendre = document.createElement('button');
    rendre.type = 'button';
    rendre.dataset.testid = 'btn-rendre';
    rendre.textContent = 'Rendre';
    rendre.addEventListener('click', () => rendreJeu(e));
    const prolonger = document.createElement('button');
    prolonger.type = 'button';
    prolonger.className = 'secondaire';
    prolonger.dataset.testid = 'btn-prolonger';
    prolonger.textContent = 'Prolonger';
    prolonger.addEventListener('click', () => prolongerJeu(e));
    ligne.querySelector('.actions').append(rendre, prolonger);
  }
  return ligne;
}

async function rendreJeu(e) {
  afficherMessage('');
  try {
    const resultat = await api.rendre(e.id);
    if (resultat.joursRetard === 0) {
      afficherMessage('Jeu rendu, merci !');
    } else {
      afficherMessage(`Jeu rendu avec ${resultat.joursRetard} jour(s) de retard : pénalité de ${formaterEuros(resultat.penalite)}.`);
    }
    await afficher();
  } catch (erreur) {
    afficherMessage(erreur.message, true);
  }
}

async function prolongerJeu(e) {
  afficherMessage('');
  try {
    const resultat = await api.prolonger(e.id);
    afficherMessage(`Prolongation acceptée : nouveau retour le ${formaterDate(resultat.dateRetourPrevue)}.`);
    await afficher();
  } catch (erreur) {
    afficherMessage(erreur.message, true);
  }
}

async function annulerReservation(r) {
  afficherMessage('');
  try {
    await api.annulerReservation(r.id);
    afficherMessage('Réservation annulée.');
    await afficher();
  } catch (erreur) {
    afficherMessage(erreur.message, true);
  }
}

function rendreReservation(r) {
  const item = document.createElement('li');
  item.className = 'reservation';
  item.dataset.reservationId = r.id;
  item.innerHTML = `<span>${r.jeu.nom} — position ${r.rang}</span>`;
  const bouton = document.createElement('button');
  bouton.type = 'button';
  bouton.className = 'secondaire';
  bouton.dataset.testid = 'btn-annuler-reservation';
  bouton.textContent = 'Annuler';
  bouton.addEventListener('click', () => annulerReservation(r));
  item.appendChild(bouton);
  return item;
}

async function afficher() {
  const emprunts = await api.mesEmprunts();
  const enCours = emprunts.filter((e) => e.statut === 'en_cours').length;
  compteur.textContent = `${enCours} emprunt${enCours > 1 ? 's' : ''} en cours sur 2`;
  corps.innerHTML = '';
  for (const e of emprunts) {
    corps.appendChild(rendreLigne(e));
  }
  const reservations = await api.mesReservations();
  listeReservations.innerHTML = '';
  aucuneReservation.hidden = reservations.length > 0;
  for (const r of reservations) {
    listeReservations.appendChild(rendreReservation(r));
  }
}

if (membre) afficher();
