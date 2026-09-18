// Page Catalogue : chargement, filtres, boutons Emprunter et Réserver.
import * as api from '../api.js';
import { formaterDate } from '../dates.js';
import { afficherMessage } from '../session.js';

const liste = document.querySelector('#jeux');
const chargement = document.querySelector('#chargement');
const recherche = document.querySelector('#recherche');
const filtreJoueurs = document.querySelector('#joueurs');
const filtreDuree = document.querySelector('#duree');

function libelleDisponibilite(jeu) {
  if (jeu.statut !== 'disponible') return 'Indisponible';
  if (jeu.disponibles === 0) return 'Aucun exemplaire disponible';
  const s = jeu.disponibles > 1 ? 's' : '';
  return `${jeu.disponibles} exemplaire${s} disponible${s} sur ${jeu.exemplaires}`;
}

function rendreJeu(jeu) {
  const retire = jeu.statut !== 'disponible';
  const item = document.createElement('li');
  item.className = 'jeu';
  item.dataset.jeuId = jeu.id;
  item.innerHTML = `
    <a class="nom" href="/jeu.html?id=${jeu.id}">${jeu.nom}</a>
    <span class="joueurs">${jeu.joueursMin} à ${jeu.joueursMax} joueurs</span>
    <span class="duree">${jeu.dureeMinutes} min</span>
    <span class="age">Dès ${jeu.ageMin} ans</span>
    <span class="categorie">${jeu.categorie}</span>
    <span class="disponibilite ${retire || jeu.disponibles === 0 ? 'indisponible' : ''}">${libelleDisponibilite(jeu)}</span>
    ${retire || jeu.disponibles > 0
      ? `<button type="button" data-testid="btn-emprunter" ${retire ? 'disabled' : ''}>Emprunter</button>`
      : '<button type="button" class="secondaire" data-testid="btn-reserver">Réserver</button>'}
  `;
  const bouton = item.querySelector('button');
  bouton.addEventListener('click', () => agir(bouton.dataset.testid === 'btn-emprunter' ? 'emprunter' : 'reserver', jeu));
  return item;
}

async function agir(action, jeu) {
  if (!api.membreConnecte()) {
    window.location.href = `/connexion.html?retour=${encodeURIComponent('/index.html')}`;
    return;
  }
  try {
    if (action === 'emprunter') {
      const emprunt = await api.emprunter(jeu.id);
      afficherMessage(`Emprunt confirmé : ${jeu.nom}, à rendre le ${formaterDate(emprunt.dateRetourPrevue)}.`);
    } else {
      const reservation = await api.reserver(jeu.id);
      afficherMessage(`Réservation enregistrée : ${jeu.nom}, position ${reservation.rang}.`);
    }
    await afficherJeux(true);
  } catch (e) {
    afficherMessage(e.message, true);
  }
}

// Numéro du dernier chargement demandé : une réponse plus ancienne est ignorée.
let chargementCourant = 0;

async function afficherJeux(conserverMessage = false) {
  const numero = ++chargementCourant;
  chargement.hidden = false;
  liste.innerHTML = '';
  if (!conserverMessage) afficherMessage('');
  try {
    const jeux = await api.chargerJeux({
      joueurs: filtreJoueurs.value,
      dureeMax: filtreDuree.value,
      recherche: recherche.value
    });
    if (numero !== chargementCourant) return;
    chargement.hidden = true;
    if (jeux.length === 0) {
      afficherMessage('Aucun jeu ne correspond.');
      return;
    }
    for (const jeu of jeux) {
      liste.appendChild(rendreJeu(jeu));
    }
  } catch (e) {
    if (numero !== chargementCourant) return;
    chargement.hidden = true;
    afficherMessage('Erreur de chargement', true);
  }
}

recherche.addEventListener('input', () => afficherJeux());
filtreJoueurs.addEventListener('change', () => afficherJeux());
filtreDuree.addEventListener('change', () => afficherJeux());
afficherJeux();
