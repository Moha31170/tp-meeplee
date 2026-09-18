// Page Connexion.
import * as api from '../api.js';

const form = document.querySelector('#form-connexion');
const erreur = document.querySelector('#message-erreur');
const retour = new URLSearchParams(window.location.search).get('retour');

form.addEventListener('submit', async (evenement) => {
  evenement.preventDefault();
  erreur.textContent = '';
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  try {
    await api.connexion(email, password);
    window.location.href = retour || '/mes-emprunts.html';
  } catch (e) {
    document.querySelector('#password').value = '';
    erreur.textContent = e.message;
  }
});
