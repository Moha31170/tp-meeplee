// Page Fiche du jeu : détails, disponibilité, emprunt ou réservation.
import * as api from '../api.js';
import { aujourdhuiISO, formaterDate } from '../dates.js';
import { dateRetourPrevue } from '../regles.js';
import { afficherMessage } from '../session.js';

const id = new URLSearchParams(window.location.search).get('id');
const fiche = document.querySelector('#fiche');
const chargement = document.querySelector('#chargement');
const boutonEmprunter = document.querySelector('#btn-emprunter');
const boutonReserver = document.querySelector('#btn-reserver');

function libelleDisponibilite(jeu) {
  if (jeu.statut !== 'disponible') return 'Indisponible';
  if (jeu.disponibles === 0) return 'Aucun exemplaire disponible';
  const s = jeu.disponibles > 1 ? 's' : '';
  return `${jeu.disponibles} exemplaire${s} disponible${s} sur ${jeu.exemplaires}`;
}

async function afficher() {
  chargement.hidden = false;
  fiche.hidden = true;
  try {
    const jeu = await api.chargerJeu(id);
    const membre = api.membreConnecte();
    document.title = `Meeple — ${jeu.nom}`;
    document.querySelector('#titre').textContent = jeu.nom;
    document.querySelector('#joueurs').textContent = `${jeu.joueursMin} à ${jeu.joueursMax} joueurs`;
    document.querySelector('#duree').textContent = `${jeu.dureeMinutes} min`;
    document.querySelector('#age').textContent = `Dès ${jeu.ageMin} ans`;
    document.querySelector('#categorie').textContent = jeu.categorie;
    document.querySelector('#disponibilite').textContent = libelleDisponibilite(jeu);
    document.querySelector('#retour-prevu').textContent = formaterDate(dateRetourPrevue(aujourdhuiISO(), Boolean(membre?.premium)));
    boutonEmprunter.hidden = !(jeu.statut === 'disponible' && jeu.disponibles > 0);
    boutonReserver.hidden = !(jeu.statut === 'disponible' && jeu.disponibles === 0);
    if (jeu.statut !== 'disponible') afficherMessage('Jeu indisponible.', true);
    chargement.hidden = true;
    fiche.hidden = false;
    return jeu;
  } catch (e) {
    chargement.hidden = true;
    afficherMessage(e.message, true);
    return null;
  }
}

async function agir(action) {
  if (!api.membreConnecte()) {
    window.location.href = `/connexion.html?retour=${encodeURIComponent(`/jeu.html?id=${id}`)}`;
    return;
  }
  try {
    if (action === 'emprunter') {
      const emprunt = await api.emprunter(id);
      afficherMessage(`Emprunt confirmé : ${emprunt.jeu.nom}, à rendre le ${formaterDate(emprunt.dateRetourPrevue)}.`);
    } else {
      const reservation = await api.reserver(id);
      afficherMessage(`Réservation enregistrée : ${reservation.jeu.nom}, position ${reservation.rang}.`);
    }
    const jeu = await api.chargerJeu(id);
    document.querySelector('#disponibilite').textContent = libelleDisponibilite(jeu);
    boutonEmprunter.hidden = !(jeu.disponibles > 0);
    boutonReserver.hidden = !(jeu.disponibles === 0);
  } catch (e) {
    afficherMessage(e.message, true);
  }
}

boutonEmprunter.addEventListener('click', () => agir('emprunter'));
boutonReserver.addEventListener('click', () => agir('reserver'));
afficher();
