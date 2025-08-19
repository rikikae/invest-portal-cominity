document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('searchBox');
  const results = document.getElementById('searchResults');
  /* recommend grid removed */}</div><div>${t.name}</div>`;
      d.addEventListener('click', () => location.href = 'glossary.html?q=' + encodeURIComponent(t.name));
      recGrid.appendChild(d);
    });
  }
  if (!box || !results || !window.TERMS) return;
  box.addEventListener('input', () => {
    const q = (box.value || '').toLowerCase();
    results.innerHTML = '';
    if (!q) return;
    window.TERMS.filter(t => t.name.toLowerCase().includes(q))
      .slice(0, 8)
      .forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="glossary.html?q=${encodeURIComponent(t.name)}">${t.name}</a>`;
        results.appendChild(li);
      });
  });
});