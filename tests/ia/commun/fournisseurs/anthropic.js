// Fournisseur réel : API Anthropic (Messages) par fetch, sans SDK.
// La clé vient de l'environnement (ANTHROPIC_API_KEY), jamais du code.
export async function repondreAnthropic({ systeme, utilisateur, maxTokens, modele }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY absente : exportez la clé dans le terminal, ou repassez en IA_FOURNISSEUR=mock.');
  }
  const reponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model: modele, max_tokens: maxTokens, system: systeme, messages: [{ role: 'user', content: utilisateur }] })
  });
  if (reponse.status === 401) throw new Error('Clé d\'API refusée (401) : vérifiez ANTHROPIC_API_KEY.');
  if (reponse.status === 429) throw new Error('Limite de débit atteinte (429) : réessayez plus tard.');
  if (!reponse.ok) throw new Error(`Erreur API ${reponse.status} : ${await reponse.text()}`);
  const donnees = await reponse.json();
  return {
    texte: donnees.content.filter((bloc) => bloc.type === 'text').map((bloc) => bloc.text).join('\n'),
    jetons: { entree: donnees.usage.input_tokens, sortie: donnees.usage.output_tokens, estimes: false },
    arret: donnees.stop_reason,
    modele: donnees.model
  };
}
