async function renderTerms(){
  const res = await fetch('data/terms.json');
  const data = await res.json();
  const root = document.getElementById('results');
  root.innerHTML = data.map(t => `<div class='card'><h3>${t.title}</h3><p>${t.definition}</p></div>`).join('');
}
window.addEventListener('DOMContentLoaded', renderTerms);
