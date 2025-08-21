
(async function(){
  const input = document.getElementById('q');
  const box = document.getElementById('search-results');
  if(!input || !box) return;
  let index = [];
  try {
    const res = await fetch('data/terms_index.json');
    index = await res.json();
  } catch(e) { /* noop */ }

  function render(results){
    if(!results.length){ box.innerHTML = ''; return; }
    box.innerHTML = '<ul class="search-list">' + results.map(r=>`<li><a href="${r.url}"><strong>${r.title}</strong></a><br><span>${r.summary}…</span></li>`).join('') + '</ul>';
  }
  input.removeAttribute('disabled');
  input.addEventListener('input', (e)=>{
    const q = e.target.value.trim();
    if(!q){ render([]); return; }
    const qs = q.toLowerCase();
    const results = index.filter(it => (it.title+it.content).toLowerCase().includes(qs)).slice(0,20);
    render(results);
  });
})();
