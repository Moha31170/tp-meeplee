// Éléments communs à toutes les pages : navigation, message, pied de page.
import * as api from './api.js';
import { VERSION } from './config.js';

// La façade est exposée pour la console et les tests (page.evaluate).
window.meeple = api;

export function afficherMessage(texte, estErreur = false) {
  const zone = document.querySelector('#message');
  zone.textContent = texte;
  zone.classList.toggle('erreur', estErreur);
}

export function exigerSession(retour) {
  const membre = api.membreConnecte();
  if (!membre) {
    window.location.href = `/connexion.html?retour=${encodeURIComponent(retour)}`;
  }
  return membre;
}

function rendreNavigation() {
  const membre = api.membreConnecte();
  const nav = document.querySelector('nav');
  nav.innerHTML = `
    <a href="/index.html">Catalogue</a>
    <a href="/mes-emprunts.html">Mes emprunts</a>
    ${membre
      ? `<span class="membre">${membre.prenom}</span><button id="btn-deconnexion" type="button">Déconnexion</button>`
      : '<a id="lien-compte" href="/connexion.html">Connexion</a>'}
  `;
  const bouton = nav.querySelector('#btn-deconnexion');
  if (bouton) {
    bouton.addEventListener('click', async () => {
      await api.deconnexion();
      window.location.href = '/index.html';
    });
  }
}

function rendrePiedDePage() {
  const pied = document.querySelector('footer');
  pied.innerHTML = `
    <span>Meeple ${VERSION} — ludothèque en ligne, application école, données fictives</span>
    <button id="btn-reinitialiser" type="button">Réinitialiser les données</button>
  `;
  pied.querySelector('#btn-reinitialiser').addEventListener('click', async () => {
    await api.reinitialiser();
    window.location.href = '/index.html';
  });
}

rendreNavigation();
rendrePiedDePage();
