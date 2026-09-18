// Page Créer un compte.
import * as api from '../api.js';
import { afficherMessage } from '../session.js';

const form = document.querySelector('#form-inscription');
const erreurs = document.querySelector('#erreurs');

form.addEventListener('submit', async (evenement) => {
  evenement.preventDefault();
  erreurs.innerHTML = '';
  afficherMessage('');
  try {
    await api.inscription({
      prenom: document.querySelector('#prenom').value.trim(),
      email: document.querySelector('#email').value.trim(),
      password: document.querySelector('#password').value,
      premium: document.querySelector('#premium').checked
    });
    afficherMessage('Compte créé, vous pouvez vous connecter.');
    const lien = document.createElement('a');
    lien.href = '/connexion.html';
    lien.textContent = 'Se connecter';
    document.querySelector('#message').append(' ', lien);
    form.reset();
  } catch (e) {
    const li = document.createElement('li');
    li.textContent = e.message;
    erreurs.appendChild(li);
  }
});
