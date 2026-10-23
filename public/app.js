const list = document.getElementById('list');
const form = document.getElementById('form');

function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function refresh() {
  const items = await fetch('/api/messages').then((r) => r.json());
  list.innerHTML = items.map((i) => `
    <li>
      <strong>${esc(i.name)}</strong>
      <div>${esc(i.text)}</div>
      <div class="meta">${new Date(i.createdAt).toLocaleString()}</div>
      <button class="del" data-id="${i.id}">刪除</button>
    </li>`).join('') || '<li>還沒有留言</li>';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: document.getElementById('name').value, text: document.getElementById('text').value }),
  });
  document.getElementById('text').value = '';
  refresh();
});

list.addEventListener('click', async (e) => {
  if (!e.target.classList.contains('del')) return;
  await fetch(`/api/messages/${e.target.dataset.id}`, { method: 'DELETE' });
  refresh();
});

fetch('/api/health').then((r) => r.json())
  .then(() => { document.getElementById('status').textContent = '後端連線正常 ✅'; })
  .catch(() => { document.getElementById('status').textContent = '後端連線失敗 ❌'; });

refresh();
