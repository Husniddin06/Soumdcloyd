const tg = window.Telegram?.WebApp || null;
if (tg) {
  tg.ready();
  tg.expand();
}

// STATE
let paidUser = false;
let currentTracks = [];

// TELEGRAM / UI

function openBot() {
  window.open('https://t.me/VkMuzicXbot', '_blank');
}

function showPremium() {
  alert('PRO доступ:\n1 месяц - 50₽\n3 месяца - 100₽\n6 месяцев - 150₽');
}

function pay(plan) {
  console.log('PAY PLAN:', plan);
  window.open(
    'https://www.sberbank.ru/ru/choise_bank?requisiteNumber=79990402614&bankCode=100000000111',
    '_blank'
  );
}

function paid() {
  if (tg) {
    const payload = {
      action: 'paid',
      user: tg.initDataUnsafe?.user || null,
      ts: Date.now()
    };
    tg.sendData(JSON.stringify(payload));
    tg.showAlert('Информация об оплате отправлена администратору');
  } else {
    alert('Информация об оплате отправлена');
  }

  paidUser = true;
  updateProStatus();
}

function updateProStatus() {
  const el = document.getElementById('proStatus');
  if (!el) return;
  el.textContent = paidUser ? 'Статус: PRO ✅' : 'Статус: FREE';
}

// DEMO BUTTONS – lekin backend orqali real qidiruv
async function playDemo(type) {
  const query =
    type === '8d'
      ? 'Imagine Dragons Believer 8D audio'
      : 'Bass boosted song';

  document.getElementById('nowPlaying').innerText =
    type === '8d' ? 'Now Playing: 8D Demo' : 'Now Playing: Bass Boost Demo';
  document.getElementById('playType').innerText = 'Source: YouTube';

  // Demo ham real qidiruv: /api/search
  const tracks = await searchOnBackend(query);
  if (tracks.length > 0) {
    playTrack(tracks[0]);
  }
}

// BACKEND BILAN ISHLASH

async function searchOnBackend(q) {
  if (!q) return [];
  try {
    const resp = await fetch(
      `/api/search?query=${encodeURIComponent(q)}`,
      {
        headers: {
          'X-Telegram-InitData': tg?.initData || ''
        }
      }
    );
    const data = await resp.json();
    return data || [];
  } catch (e) {
    console.error(e);
    alert('Ошибка поиска трека (бот API)');
    return [];
  }
}

async function searchMusic() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) {
    currentTracks = [];
    renderMusic(currentTracks);
    return;
  }

  const tracks = await searchOnBackend(q);
  currentTracks = tracks;
  renderMusic(currentTracks);
}

// TREK CHIZISH VA CHALISH

const grid = document.getElementById('musicGrid');

function renderMusic(list) {
  grid.innerHTML = '';

  if (!list || list.length === 0) {
    const empty = document.createElement('div');
    empty.style.gridColumn = '1/-1';
    empty.style.textAlign = 'center';
    empty.style.opacity = '0.8';
    empty.innerText = 'Ничего не найдено. Попробуйте другой запрос.';
    grid.appendChild(empty);
    return;
  }

  list.forEach((t) => {
    const div = document.createElement('div');
    div.className = 'card';

    const premiumTag = t.isPremium
      ? '<span class="tag tag-premium">PRO 🔒</span>'
      : '<span class="tag tag-free">FREE</span>';

    div.innerHTML = `
      <h3>${t.title} ${premiumTag}</h3>
      <small>${t.artist || ''}</small><br>
      <button class="btn btn-primary">▶️ Play</button>
    `;

    const btn = div.querySelector('button');
    btn.onclick = () => playTrack(t);

    grid.appendChild(div);
  });
}

function playTrack(track) {
  if (track.isPremium && !paidUser) {
    alert('🔒 Премиум трек. Купите PRO, чтобы слушать.');
    return;
  }

  document.getElementById('nowPlaying').innerText =
    'Now Playing: ' + track.title;
  document.getElementById('playType').innerText = 'Source: YouTube';

  const iframe = document.getElementById('mainPlayer');

  // YouTube watch link -> embed
  if (track.url && track.url.includes('youtube.com/watch')) {
    const idMatch = track.url.match(/v=([^&]+)/);
    const videoId = idMatch ? idMatch[1] : null;
    if (videoId) {
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else {
      iframe.src = track.url;
    }
  } else {
    // boshqa sayt bo'lsa, shu URL ni qo'yamiz (agar player ko‘tarsa)
    iframe.src = track.url;
  }
}

// INIT

updateProStatus();

(async () => {
  try {
    if (!tg) return;
    const resp = await fetch('/api/checkPremium', {
      headers: {
        'X-Telegram-InitData': tg.initData || ''
      }
    });
    const data = await resp.json();
    paidUser = !!data.isPremium;
    updateProStatus();
  } catch (e) {
    console.warn('checkPremium error', e);
  }
})();
