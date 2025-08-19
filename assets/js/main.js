// Glossary cross-page search on hub
document.addEventListener('DOMContentLoaded', () => {
  const input = document.querySelector('#glossarySearch');
  const terms = document.querySelectorAll('#glossaryList .term');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    terms.forEach(el => {
      const text = el.innerText.toLowerCase();
      el.style.display = q ? (text.includes(q) ? '' : '') : '';
      if (q && !text.includes(q)) el.style.display = 'none';
    });
  });
});
