// Fournisseur local : un modèle servi par Ollama sur le poste (port 11434).
const ADRESSE = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function repondreOllama({ systeme, utilisateur }) {
  const modele = process.env.IA_MODELE_OLLAMA || 'llama3.2';
  const reponse = await fetch(`${ADRESSE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modele, stream: false, options: { temperature: 0 },
      messages: [{ role: 'system', content: systeme }, { role: 'user', content: utilisateur }]
    })
  });
  if (!reponse.ok) throw new Error(`Ollama a répondu ${reponse.status}`);
  const donnees = await reponse.json();
  return {
    texte: donnees.message?.content ?? '',
    jetons: { entree: donnees.prompt_eval_count ?? 0, sortie: donnees.eval_count ?? 0, estimes: false },
    arret: donnees.done_reason ?? 'stop',
    modele
  };
}
