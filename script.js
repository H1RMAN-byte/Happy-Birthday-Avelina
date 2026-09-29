
const CONGRATS_TEXT =
`Авелина. С днём рождения! 

Ты самый яркий, интересный и замечательный человек в моей жизни.

Я приготовил для тебя кое-что особенное)`;

const PHOTOS_PER_PAGE = 2;
const GALLERY_PHOTOS = [
  { src: 'photos/1.jpg', caption: 'Секс бомба' },
  { src: 'photos/2.jpg', caption: 'Букет к платью' },
  { src: 'photos/3.jpg', caption: 'Лучший вечер' },
  { src: 'photos/4.jpg', caption: 'Велосипедная прогулка' },
  { src: 'photos/5.jpg', caption: 'Щербакова' },
  { src: 'photos/6.jpg', caption: 'Мой любимый человек' },
];

const MINI_PHOTOS = [
  'photos/mini1.jpg',
  'photos/mini2.jpg',
  'photos/mini3.jpg',
  'photos/mini4.jpg',
  'photos/mini5.jpg',
  'photos/mini6.jpg',
  'photos/mini7.jpg',
  'photos/mini8.jpg',
  'photos/mini9.jpg',
  'photos/mini10.jpg',
];

const HEART_DOTS = 90;

const DOT_DELAY = 45;

(function initBackground() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  const FONT_SIZE = 18;
  const COL_STEP = 20;
  const GLYPHS = ['❤','💗','💕','✦','✧','♥','♡','·','+'];
  
  const COLORS = ['#ff9ec4','#ff5c8a','#e8c66a','#ffb3d1','#ffd9e6'];

  let columns = [];
  let dpr = Math.max(1, window.devicePixelRatio || 1);

  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    W = canvas.width  = window.innerWidth  * dpr;
    H = canvas.height = window.innerHeight * dpr;
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';

    const count = Math.ceil(W / (COL_STEP * dpr)) + 1;

    columns = [];
    for (let i = 0; i < count; i++) {
      columns.push(makeColumn(i * COL_STEP * dpr));
    }
  }

  function makeColumn(x) {
    const tail = 12 + Math.floor(Math.random() * 18);
   
    const speed = (2.5 + Math.random() * 5) * dpr;
   
    const glyphs = [];
    for (let i = 0; i < tail; i++) {
      glyphs.push({
        ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
    return {
      x,
      y: -Math.random() * H,   
      speed,
      tail,
      glyphs,
      font: FONT_SIZE * dpr,
    };
  }

  function draw() {
    ctx.fillStyle = 'rgba(10, 5, 10, 0.28)';
    ctx.fillRect(0, 0, W, H);

    ctx.font = `${FONT_SIZE * dpr}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (const col of columns) {
      for (let i = 0; i < col.tail; i++) {
        const y = col.y - i * FONT_SIZE * dpr;
        if (y < -FONT_SIZE * dpr || y > H) continue;

        const alpha = 1 - i / col.tail;   
        const g = col.glyphs[i];

        if (i === 0) {
          ctx.shadowColor = g.color;
          ctx.shadowBlur = 18 * dpr;
        } else if (i < 3) {
          ctx.shadowColor = g.color;
          ctx.shadowBlur = 10 * dpr;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = g.color;
        ctx.fillText(g.ch, col.x, y);

        if (Math.random() < 0.02) {
          g.ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          g.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
      }

      col.y += col.speed;

      if (col.y - col.tail * FONT_SIZE * dpr > H) {
        const fresh = makeColumn(col.x);
        Object.assign(col, fresh);
      }
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
})();
const stages = {
  envelope: document.getElementById('stageEnvelope'),
  message:  document.getElementById('stageMessage'),
  gallery:  document.getElementById('stageGallery'),
  heart:    document.getElementById('stageHeart'),
};

function showStage(name) {
  Object.values(stages).forEach(s => s.classList.remove('active', 'leaving'));
  stages[name].classList.add('active');
}

function leaveStage(name, after) {
  stages[name].classList.add('leaving');
  setTimeout(() => {
    stages[name].classList.remove('active', 'leaving');
    after && after();
  }, 700);
}

const music = document.getElementById('bgMusic');
const soundBtn = document.getElementById('soundToggle');
let musicStarted = false;

function startMusic() {
  music.volume = 0.5;
  music.play().then(() => {
    musicStarted = true;
    soundBtn.classList.remove('hidden');
    soundBtn.textContent = '🔊';
  }).catch(() => {
    // Если браузер не дал запустить (например, нет файла) — просто игнорируем
  });
}

soundBtn.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    soundBtn.textContent = '🔊';
  } else {
    music.pause();
    soundBtn.textContent = '🔇';
  }
});

/* ============================================================
   ЭТАП 1 → ЭТАП 2: клик по конверту
   ============================================================ */
const envelope = document.getElementById('envelope');
let opened = false;

envelope.addEventListener('click', () => {
  if (opened) return;
  opened = true;
  envelope.classList.add('open');
  startMusic();

  // Даём анимации конверта доиграть и переходим
  setTimeout(() => {
    leaveStage('envelope', () => {
      showStage('message');
      setTimeout(typeMessage, 400);
    });
  }, 900);
});

/* ============================================================
   ЭТАП 2: печатающийся текст
   ============================================================ */
const typedEl = document.getElementById('typedText');
const toGalleryBtn = document.getElementById('toGallery');

function typeMessage() {
  typedEl.textContent = '';
  typedEl.classList.remove('done');
  let i = 0;
  const speed = 20; // мс на символ — уменьши, если хочешь быстрее

  (function tick() {
    if (i < CONGRATS_TEXT.length) {
      typedEl.textContent += CONGRATS_TEXT[i++];
      setTimeout(tick, speed);
    } else {
      typedEl.classList.add('done');
      toGalleryBtn.classList.remove('hidden');
    }
  })();
}

toGalleryBtn.addEventListener('click', () => {
  leaveStage('message', () => {
    showStage('gallery');
    buildGallery();
  });
});

/* ============================================================
   ЭТАП 3: галерея полароидов
   ============================================================ */
let galleryBuilt = false;
let currentPage = 0;

function buildGallery() {
  if (galleryBuilt) return;
  galleryBuilt = true;

  const book = document.getElementById('book');
  const dotsWrap = document.getElementById('bookDots');

  // Разбиваем фото на страницы по PHOTOS_PER_PAGE
  const pages = [];
  for (let i = 0; i < GALLERY_PHOTOS.length; i += PHOTOS_PER_PAGE) {
    pages.push(GALLERY_PHOTOS.slice(i, i + PHOTOS_PER_PAGE));
  }

  pages.forEach((pagePhotos, idx) => {
    const page = document.createElement('div');
    page.className = 'book-page' + (idx === 0 ? ' active' : '');
    page.dataset.index = idx;

    pagePhotos.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'polaroid';
      card.style.setProperty('--rot', (Math.random() * 4 - 2).toFixed(2) + 'deg');

      const img = document.createElement('img');
      img.src = p.src;
      img.alt = p.caption;
      img.onerror = () => {
  // вместо удаления — просто подменяем фон, размеры сохраняются
  img.style.background = 'linear-gradient(135deg,#3a1224,#5a1a33)';
  img.alt = '📷';
  img.removeAttribute('src');   // чтобы не пытался грузить снова
  // вставляем эмодзи поверх как отдельный элемент? — нет,
  // достаточно показать фон, главное — img остаётся в DOM и держит размеры
};

      const cap = document.createElement('div');
      cap.className = 'caption';
      cap.textContent = p.caption;

      card.appendChild(img);
      card.appendChild(cap);
      page.appendChild(card);
    });

    book.appendChild(page);

    // Точка-индикатор
    const dot = document.createElement('span');
    if (idx === 0) dot.classList.add('on');
    dotsWrap.appendChild(dot);
  });

  // Свайпы и клавиши
  attachBookControls(pages.length);
}

function attachBookControls(total) {
  const book = document.getElementById('book');
  const dots = document.querySelectorAll('#bookDots span');

  function goTo(idx) {
  if (idx < 0 || idx >= total) return;   // вышли за пределы — игнорируем
  if (idx === currentPage) return;

  const allPages = document.querySelectorAll('.book-page');
  const prev = allPages[currentPage];
  const next = allPages[idx];

  // старая страница улетает
  prev.classList.add('flipping');
  prev.classList.remove('active');
  setTimeout(() => prev.classList.remove('flipping'), 700);

  // новая приходит
  setTimeout(() => next.classList.add('active'), 120);

  currentPage = idx;
  dots.forEach((d, i) => d.classList.toggle('on', i === idx));
}

  // Свайп
  let startX = 0, startY = 0, tracking = false;

  book.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  }, { passive: true });

  book.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) {
  if (currentPage + 1 >= total) closeBook();
  else goTo(currentPage + 1);
}
    else goTo(currentPage - 1);
  });

  // Мышь (для ПК)
  let mouseDown = false;
  book.addEventListener('mousedown', (e) => { mouseDown = true; startX = e.clientX; });
  book.addEventListener('mouseup', (e) => {
    if (!mouseDown) return;
    mouseDown = false;
    const dx = e.clientX - startX;
    if (Math.abs(dx) < 60) return;
    if (dx < 0) {
  if (currentPage + 1 >= total) closeBook();
  else goTo(currentPage + 1);
}
    else goTo(currentPage - 1);
  });

  // Клавиши
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('stageGallery').classList.contains('active')) return;
    if (e.key === 'ArrowRight') {
  if (currentPage + 1 >= total) closeBook();
  else goTo(currentPage + 1);
}
    if (e.key === 'ArrowLeft') goTo(currentPage - 1);
  });
}
/* Закрытие книжки и переход к сердцу */
let bookClosing = false;

function closeBook() {
  if (bookClosing) return;
  bookClosing = true;

  const book = document.getElementById('book');
  book.classList.add('closing');

  // ждём, пока книга «захлопнется» (1.1s), затем уводим сцену галереи
  setTimeout(() => {
    leaveStage('gallery', () => {
      showStage('heart');
      setTimeout(drawHeart, 400);
      bookClosing = false;   // сброс для replay
    });
  }, 1100);
}
/* ============================================================
   ЭТАП 4: сердце из мини-фотографий
   ============================================================ */
let heartDrawn = false;

function heartPoint(t) {
  // Параметрическое уравнение сердца
  // x = 16 sin^3 t
  // y = 13 cos t − 5 cos 2t − 2 cos 3t − cos 4t
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t)
          - 5 * Math.cos(2 * t)
          - 2 * Math.cos(3 * t)
          - Math.cos(4 * t);
  return { x, y };
}

function drawHeart() {
  if (heartDrawn) return;
  heartDrawn = true;

  const scene = document.getElementById('heartScene');
  const finalText = document.getElementById('finalText');
  finalText.classList.remove('show');

  // Убираем старые мини-фото (если были при replay)
  scene.querySelectorAll('.mini-photo').forEach(n => n.remove());

  // Размеры сцены
  const rect = scene.getBoundingClientRect();
  const scale = Math.min(rect.width, rect.height) / 40; // 40 — примерный размах
  const cx = rect.width / 2;
  const cy = rect.height / 2;

  // Находим границы сердца для центрирования
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i <= HEART_DOTS; i++) {
    const t = (i / HEART_DOTS) * Math.PI * 2;
    const p = heartPoint(t);
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const w = maxX - minX;
  const h = maxY - minY;
  const fitScale = Math.min(rect.width * 0.85 / w, rect.height * 0.85 / h);

  for (let i = 0; i <= HEART_DOTS; i++) {
    const t = (i / HEART_DOTS) * Math.PI * 2;
    const p = heartPoint(t);

    const px = cx + (p.x - (minX + w / 2)) * fitScale;
    const py = cy - (p.y - (minY + h / 2)) * fitScale; // минус — ось Y вниз

    const img = document.createElement('img');
    img.className = 'mini-photo';
    img.src = MINI_PHOTOS[i % MINI_PHOTOS.length];
    img.alt = '';
    img.style.left = (px - 19) + 'px';
    img.style.top  = (py - 19) + 'px';
    img.style.animationDelay = (i * DOT_DELAY) + 'ms';

    // Если мини-фото не найдено — подставим кружок с сердечком
    img.onerror = () => {
      img.remove();
      const dot = document.createElement('div');
      dot.className = 'mini-photo';
      dot.style.left = (px - 19) + 'px';
      dot.style.top  = (py - 19) + 'px';
      dot.style.background = 'linear-gradient(135deg,#ff5c8a,#e8c66a)';
      dot.style.display = 'flex';
      dot.style.alignItems = 'center';
      dot.style.justifyContent = 'center';
      dot.style.fontSize = '14px';
      dot.textContent = '❤';
      scene.appendChild(dot);
      setTimeout(() => dot.classList.add('on'), i * DOT_DELAY);
    };

    scene.appendChild(img);
    setTimeout(() => img.classList.add('on'), i * DOT_DELAY);
  }

  // Когда контур замкнулся — показываем финальный текст
  const totalTime = HEART_DOTS * DOT_DELAY + 500;
  setTimeout(() => finalText.classList.add('show'), totalTime);
}

/* ============================================================
   ПОВТОРИТЬ
   ============================================================ */
document.getElementById('replay').addEventListener('click', () => {
  heartDrawn = false;
  bookClosing = false;
  opened = false;
  envelope.classList.remove('open');
  typedEl.textContent = '';
  typedEl.classList.remove('done');
  toGalleryBtn.classList.add('hidden');
  document.getElementById('book').innerHTML = '';
document.getElementById('bookDots').innerHTML = '';
document.getElementById('book').classList.remove('closing');
currentPage = 0;
  galleryBuilt = false;
  document.getElementById('finalText').classList.remove('show');
  document.getElementById('heartScene').querySelectorAll('.mini-photo').forEach(n => n.remove());

  leaveStage('heart', () => showStage('envelope'));
});