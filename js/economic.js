document.addEventListener('DOMContentLoaded', async () => {
  const list = document.getElementById('economic-list');
  try {
    const res = await fetch("https://api.tradingeconomics.com/calendar?c=guest:guest&f=json");
    const data = await res.json();
    list.innerHTML = "";
    data.slice(0, 8).forEach(it => {
      const li = document.createElement('li');
      li.textContent = `${it.Country || '-'} ${it.Event || '-'}: 予想 ${it.Forecast ?? '-'} → 結果 ${it.Actual ?? '-'}`;
      list.appendChild(li);
    });
  } catch (e) {
    list.innerHTML = "<li>経済指標の取得に失敗しました。</li>";
    console.error(e);
  }
});