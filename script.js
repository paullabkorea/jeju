/* ===========================================================
   만조 滿潮 · 제주 탑동 카페 랜딩페이지 스크립트
   - 메뉴 렌더링 & 필터
   - Leaflet 지도 (제주국제공항 → 제주더큰내일센터 1층)
   - 아이디어 카드 선택
   - 일몰 / 만조 시각 표시
   =========================================================== */

/* JS가 살아 있을 때만 등장 애니메이션을 겁니다.
   (스크립트가 막혀도 본문이 보이지 않는 일이 없도록) */
document.documentElement.classList.add('js');

/* -----------------------------------------------------------
   좌표
   ※ 카페 좌표는 탑동 제주더큰내일센터 기준의 근사값입니다.
     실측 좌표를 아시면 CAFE 값만 바꾸면 지도가 그대로 맞춰집니다.
   ----------------------------------------------------------- */
const AIRPORT = { lat: 33.5070, lng: 126.4930, name: '제주국제공항' };
const CAFE    = { lat: 33.5152, lng: 126.5190, name: '만조 滿潮' };

/* 공항 → 용담 해안도로 → 용두암 → 서부두 → 탑동 (예상 경로) */
const ROUTE = [
  [33.5071, 126.4930],
  [33.5078, 126.4952],
  [33.5090, 126.4972],
  [33.5108, 126.4995],
  [33.5128, 126.5031],
  [33.5142, 126.5074],
  [33.5155, 126.5122],
  [33.5153, 126.5158],
  [33.5150, 126.5178],
  [33.5152, 126.5190]
];

const WAYPOINTS = [
  { at: [33.5155, 126.5122], label: '용두암' },
  { at: [33.5150, 126.5178], label: '탑동 광장' }
];

/* -----------------------------------------------------------
   메뉴 데이터
   ----------------------------------------------------------- */
const MENU = [
  {
    cat: 'signature', best: true,
    name: '만조 滿潮 라떼', en: 'Manjo Latte', price: '6,800',
    desc: '흑임자 크림이 잔 아래로 천천히 차오릅니다. 다 차오르는 데 약 90초, 그때 마시는 게 가장 맛있습니다.',
    tags: ['시그니처', '흑임자', '단짠']
  },
  {
    cat: 'signature', best: true,
    name: '귤빛 말차', en: 'Tangerine Matcha', price: '6,500',
    desc: '서귀포 노지 감귤청 위에 제주 유기농 말차를 얹었습니다. 젓지 않고 층째로 한 모금.',
    tags: ['감귤 말차 티', '논커피', '제주산 말차']
  },
  {
    cat: 'signature',
    name: '현무암 아인슈페너', en: 'Basalt Einspanner', price: '7,000',
    desc: '검은 숯가루를 입힌 소금 크림과 진한 에스프레소. 표면이 현무암처럼 거칠게 굳습니다.',
    tags: ['숯 소금', '진한 맛']
  },
  {
    cat: 'signature',
    name: '해녀의 숨비', en: 'Sumbi Soda', price: '6,000',
    desc: '레몬·생강·제주 꿀을 넣은 탄산. 한 번에 들이켜면 숨비소리처럼 목이 시원해집니다.',
    tags: ['논커피', '탄산', '개운함']
  },
  {
    cat: 'coffee',
    name: '동틀 무렵', en: 'First Light Americano', price: '4,500',
    desc: '매일 아침 3kg만 볶는 그날의 원두로 내린 아메리카노. 산미와 단맛이 반씩입니다.',
    tags: ['데일리', '당일 로스팅']
  },
  {
    cat: 'coffee', best: true,
    name: '방파제 소금 커피', en: 'Breakwater Salt Coffee', price: '5,800',
    desc: '성산 천일염으로 간을 맞춘 크림이 커피 위에 얹힙니다. 탑동 방파제에서 맞는 물보라 맛.',
    tags: ['소금 크림', '시원함']
  },
  {
    cat: 'coffee',
    name: '한라봉 콜드브루 토닉', en: 'Hallabong Cold Brew Tonic', price: '6,500',
    desc: '18시간 침출한 콜드브루에 한라봉 과육과 토닉. 여름 탑동에서 제일 빨리 나가는 잔입니다.',
    tags: ['상큼', '탄산', '여름 한정']
  },
  {
    cat: 'coffee',
    name: '우도 땅콩 크림 라떼', en: 'Udo Peanut Cream Latte', price: '6,800',
    desc: '우도 땅콩을 직접 갈아 만든 크림. 고소한 것이 오래 남습니다.',
    tags: ['고소', '우도 땅콩']
  },
  {
    cat: 'tea',
    name: '오름 안개', en: 'Oreum Mist', price: '6,500',
    desc: '제주 녹차 위에 우유 거품을 두껍게 올려, 오름에 안개 걸린 모양을 만듭니다.',
    tags: ['논커피', '제주 녹차']
  },
  {
    cat: 'tea',
    name: '동백 지는 밤', en: 'Camellia Night', price: '6,000',
    desc: '히비스커스와 로즈힙을 우려 붉게 낸 티. 얼음 위에 동백 한 송이가 떨어집니다.',
    tags: ['카페인 없음', '허브티']
  },
  {
    cat: 'tea',
    name: '바람의 언덕 에이드', en: 'Windy Hill Ade', price: '6,500',
    desc: '백향과(패션프루트)와 라임을 갈아 넣은 에이드. 마시는 동안 계속 씨가 흔들립니다.',
    tags: ['백향과', '상큼']
  },
  {
    cat: 'tea',
    name: '구좌 당근 라떼', en: 'Gujwa Carrot Latte', price: '6,300',
    desc: '구좌 당근을 통째로 갈아 우유에 섞었습니다. 설탕을 거의 넣지 않아도 답니다.',
    tags: ['논커피', '구좌 당근', '아이 추천']
  },
  {
    cat: 'dessert', best: true,
    name: '오메기 브라우니', en: 'Omegi Brownie', price: '5,500',
    desc: '차조로 만든 오메기떡을 브라우니 반죽에 넣어 구웠습니다. 겉은 바삭, 안은 쫀득.',
    tags: ['시그니처 디저트', '쫀득']
  },
  {
    cat: 'dessert',
    name: '감귤 소금 스콘', en: 'Tangerine Salt Scone', price: '4,800',
    desc: '감귤 껍질을 절여 넣고 위에 굵은 소금을 뿌렸습니다. 커피와 먹으면 단맛이 두 배.',
    tags: ['버터', '단짠']
  },
  {
    cat: 'dessert',
    name: '빙떡 크로플', en: 'Bingtteok Croffle', price: '6,500',
    desc: '제주 빙떡의 무 소를 크로플 사이에 넣었습니다. 낯설지만 다들 한 접시 더 시킵니다.',
    tags: ['짭짤', '실험작']
  },
  {
    cat: 'dessert',
    name: '하르방 카눌레', en: 'Harbang Canele', price: '3,800',
    desc: '돌하르방 모양 틀에 구운 카눌레. 모자 부분이 제일 바삭합니다.',
    tags: ['한 입', '선물용']
  }
];

/* -----------------------------------------------------------
   상상 노트 (아이디어)
   ----------------------------------------------------------- */
const IDEAS = [
  {
    no: '01', title: '물때표 메뉴판',
    desc: '국립해양조사원 물때에 맞춰 메뉴판이 바뀝니다. 만조에는 시그니처 4종, 간조에는 드립 커피만. "오늘 몇 시에 뭐가 나오는지" 확인하러 SNS를 보게 만드는 장치입니다.',
    meta: ['투자 낮음', '재방문 유도', '콘텐츠 강함']
  },
  {
    no: '02', title: '더큰내일센터 코워킹 카페',
    desc: '같은 건물 인재들의 사이드 프로젝트를 벽 한 면에 상시 전시하고, 매달 데모데이 밤을 엽니다. 콘센트 전 좌석·모니터 대여·회의실 시간제 운영.',
    meta: ['투자 중간', '평일 매출', '커뮤니티']
  },
  {
    no: '03', title: '해녀 삼촌 시즌 메뉴',
    desc: '인근 해녀회와 협업해 물질 나간 날에만 나오는 메뉴를 답니다. 우뭇가사리 젤리 라떼, 톳 스콘처럼 그날 물건에 따라 바뀌는 한정판.',
    meta: ['투자 낮음', '스토리 강함', '지역 상생']
  },
  {
    no: '04', title: '감귤나무 분양 + 원두 구독',
    desc: '서귀포 과수원의 감귤나무 한 그루를 손님 이름으로 분양하고, 매달 그 나무의 사진과 원두를 보냅니다. 겨울에는 자기 나무 귤을 수확하러 제주에 옵니다.',
    meta: ['투자 높음', '반복 매출', '관광 연계']
  },
  {
    no: '05', title: '노을 예약제 · 선셋 카운터',
    desc: '창가 12석은 일몰 1시간 전부터 예약제로만 운영합니다. 예약금은 음료로 전액 차감. 매일 다른 일몰 시각을 입구 칠판에 적어 둡니다.',
    meta: ['투자 낮음', '객단가 상승', '탑동 입지']
  },
  {
    no: '06', title: '제주 블렌딩 랩',
    desc: '감귤·녹차·백향과·당근을 놓고 손님이 직접 자기 음료를 조합하는 90분 클래스. 완성한 레시피는 이름을 붙여 한 달간 메뉴판에 올려 줍니다.',
    meta: ['투자 중간', '체험 상품', '단체 예약']
  },
  {
    no: '07', title: '여행자 라운지',
    desc: '공항에서 15분 거리라는 점을 활용해 짐 보관함과 샤워실을 둡니다. 비행기 시간까지 남는 서너 시간을 파는 카페.',
    meta: ['투자 높음', '입지 활용', '관광객']
  },
  {
    no: '08', title: '심야 탑동, 무알콜 바',
    desc: '22시부터 새벽 2시까지는 조명을 낮추고 무알콜 칵테일과 에스프레소 바로 전환합니다. 탑동에 밤에 갈 곳이 없다는 빈틈을 노립니다.',
    meta: ['투자 중간', '2모작 운영', '야간 상권']
  }
];

/* -----------------------------------------------------------
   메뉴 렌더링 & 필터
   ----------------------------------------------------------- */
function renderMenu() {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;

  grid.innerHTML = MENU.map((m, i) => `
    <article class="card ${m.best ? 'card--best' : ''}" data-cat="${m.cat}" style="animation-delay:${(i % 6) * 50}ms">
      <div class="card__top">
        <h3 class="card__name">${m.name}</h3>
        <span class="card__price">${m.price}</span>
      </div>
      <p class="card__en">${m.en}</p>
      <p class="card__desc">${m.desc}</p>
      <div class="card__tags">
        ${m.tags.map((t, ti) => `<span class="tag ${ti === 0 ? 'tag--hot' : ''}">${t}</span>`).join('')}
      </div>
    </article>
  `).join('');
}

function bindMenuFilter() {
  const chips = document.querySelectorAll('.menu__tabs .chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => {
        c.classList.remove('is-active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-selected', 'true');

      const f = chip.dataset.filter;
      document.querySelectorAll('#menuGrid .card').forEach((card, i) => {
        const show = f === 'all' || card.dataset.cat === f;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          card.style.animation = 'none';
          void card.offsetWidth;            // 리플로우로 애니메이션 재생
          card.style.animation = '';
          card.style.animationDelay = (i % 6) * 40 + 'ms';
        }
      });
    });
  });
}

/* -----------------------------------------------------------
   Leaflet 지도
   ----------------------------------------------------------- */
function renderMap() {
  const el = document.getElementById('map');
  if (!el || typeof L === 'undefined') return;

  const map = L.map(el, { scrollWheelZoom: false, zoomControl: true });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20
  }).addTo(map);

  const pin = (kind, glyph) => L.divIcon({
    className: '',
    html: `<div class="pin pin--${kind}"><span>${glyph}</span></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 38],
    popupAnchor: [0, -34]
  });

  /* 경로: 흰 테두리 위에 감귤색 점선 */
  L.polyline(ROUTE, { color: '#ffffff', weight: 9, opacity: .85, lineCap: 'round' }).addTo(map);
  const line = L.polyline(ROUTE, {
    color: '#ef7b3c', weight: 4, opacity: 1, dashArray: '1 10', lineCap: 'round'
  }).addTo(map);

  /* 점선이 흐르는 애니메이션 */
  let offset = 0;
  const path = line.getElement();
  if (path && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
      offset = (offset + 1) % 22;
      path.setAttribute('stroke-dashoffset', -offset);
    }, 60);
  }

  L.marker([AIRPORT.lat, AIRPORT.lng], { icon: pin('air', '✈') })
    .addTo(map)
    .bindPopup('<b>제주국제공항</b>1층 도착층에서 나오면 택시 승강장.<br />여기서 출발합니다.');

  L.marker([CAFE.lat, CAFE.lng], { icon: pin('cafe', '☕') })
    .addTo(map)
    .bindPopup('<b>만조 滿潮</b>제주시 탑동로<br />제주더큰내일센터 <b style="display:inline">1층</b><br />08:00 – 22:00')
    .openPopup();

  WAYPOINTS.forEach(w => {
    L.circleMarker(w.at, {
      radius: 5, color: '#fff', weight: 2, fillColor: '#1f6f6a', fillOpacity: 1
    }).addTo(map).bindTooltip(w.label, { className: 'wp', direction: 'top', offset: [0, -8] });
  });

  map.fitBounds(L.latLngBounds(ROUTE), { padding: [60, 60] });

  /* 스크롤 휠 확대는 지도를 클릭했을 때만 */
  map.on('click', () => map.scrollWheelZoom.enable());
  map.on('mouseout', () => map.scrollWheelZoom.disable());
}

/* -----------------------------------------------------------
   상상 노트 카드
   ----------------------------------------------------------- */
function renderIdeas() {
  const grid = document.getElementById('labGrid');
  if (!grid) return;

  grid.innerHTML = IDEAS.map(idea => `
    <button class="idea reveal" type="button" data-no="${idea.no}" aria-pressed="false">
      <span class="idea__check" aria-hidden="true">✓</span>
      <span class="idea__no">IDEA ${idea.no}</span>
      <h3 class="idea__title">${idea.title}</h3>
      <p class="idea__desc">${idea.desc}</p>
      <span class="idea__meta">${idea.meta.map(m => `<span>${m}</span>`).join('')}</span>
    </button>
  `).join('');

  const out = document.getElementById('labPicked');
  const hint = document.getElementById('labHint');
  const picked = new Set();

  const sync = () => {
    if (!picked.size) {
      out.textContent = '아직 고르지 않았습니다. 카드를 눌러 담아보세요.';
      return;
    }
    const list = [...picked].sort()
      .map(no => `${no}. ${IDEAS.find(i => i.no === no).title}`)
      .join('  ·  ');
    out.textContent = list;
  };

  grid.querySelectorAll('.idea').forEach(btn => {
    btn.addEventListener('click', () => {
      const no = btn.dataset.no;
      const on = !picked.has(no);
      on ? picked.add(no) : picked.delete(no);
      btn.classList.toggle('is-picked', on);
      btn.setAttribute('aria-pressed', String(on));
      sync();
    });
  });

  document.getElementById('labCopy').addEventListener('click', async () => {
    if (!picked.size) {
      hint.textContent = '먼저 카드를 골라주세요.';
      return;
    }
    const text = [...picked].sort()
      .map(no => `${no}. ${IDEAS.find(i => i.no === no).title}`)
      .join('\n');
    const msg = `이 아이디어로 다시 구현해줘:\n${text}`;
    try {
      await navigator.clipboard.writeText(msg);
      hint.textContent = '복사됐습니다. 그대로 붙여넣어 주세요.';
    } catch {
      hint.textContent = msg;
    }
    setTimeout(() => { hint.textContent = ''; }, 4000);
  });
}

/* -----------------------------------------------------------
   일몰 / 만조 시각
   - 일몰: NOAA 근사식으로 계산 (제주 기준, 오차 1~2분)
   - 만조: 달의 남중을 이용한 대략 추정값. 정확한 물때는
     국립해양조사원 자료를 확인해야 하므로 '≈'로 표기합니다.
   ----------------------------------------------------------- */
function sunsetKST(date, lat, lng) {
  const rad = Math.PI / 180;
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86400000);

  const lngHour = lng / 15;
  const t = day + ((18 - lngHour) / 24);
  const M = (0.9856 * t) - 3.289;
  let Lsun = M + (1.916 * Math.sin(M * rad)) + (0.020 * Math.sin(2 * M * rad)) + 282.634;
  Lsun = (Lsun + 360) % 360;

  let RA = Math.atan(0.91764 * Math.tan(Lsun * rad)) / rad;
  RA = (RA + 360) % 360;
  RA += (Math.floor(Lsun / 90) * 90) - (Math.floor(RA / 90) * 90);
  RA /= 15;

  const sinDec = 0.39782 * Math.sin(Lsun * rad);
  const cosDec = Math.cos(Math.asin(sinDec));
  const zenith = 90.833;
  const cosH = (Math.cos(zenith * rad) - (sinDec * Math.sin(lat * rad))) / (cosDec * Math.cos(lat * rad));
  if (cosH > 1 || cosH < -1) return null;

  const H = (Math.acos(cosH) / rad) / 15;
  const T = H + RA - (0.06571 * t) - 6.622;
  const UT = ((T - lngHour) % 24 + 24) % 24;
  const kst = (UT + 9) % 24;

  const h = Math.floor(kst);
  const m = Math.round((kst - h) * 60);
  return { h: (h + Math.floor(m / 60)) % 24, m: m % 60 };
}

function pad(n) { return String(n).padStart(2, '0'); }

function renderTimes() {
  const now = new Date();

  /* 일몰 */
  const s = sunsetKST(now, CAFE.lat, CAFE.lng);
  const sunEl = document.getElementById('sunsetTime');
  if (sunEl && s) sunEl.textContent = `${pad(s.h)}:${pad(s.m)}`;

  /* 만조(추정) : 삭 이후 경과일 × 약 50분씩 밀리는 반일주조 */
  const tideEl = document.getElementById('tideTime');
  if (tideEl) {
    const newMoon = Date.UTC(2000, 0, 6, 18, 14);            // 기준 삭
    const synodic = 29.530588853 * 86400000;
    const age = (((now.getTime() - newMoon) % synodic) + synodic) % synodic / 86400000;
    const lunitidal = 8.7;                                    // 제주 북부 조시차(시간, 근사)
    let hour = (age * 0.8412 + lunitidal) % 12.42;
    while (hour < 6) hour += 12.42;                           // 영업시간대(06~22시)의 만조
    const h = Math.floor(hour), m = Math.round((hour - h) * 60);
    tideEl.textContent = `≈ ${pad((h + Math.floor(m / 60)) % 24)}:${pad(m % 60)}`;
    tideEl.title = '달의 위상으로 계산한 추정값입니다. 정확한 물때는 국립해양조사원 자료를 확인하세요.';
  }
}

/* -----------------------------------------------------------
   경로 탭 / 주소 복사 / 네비게이션 / 스크롤 등장
   ----------------------------------------------------------- */
function bindRouteTabs() {
  const tabs = document.querySelectorAll('.route__tab');
  const panels = document.querySelectorAll('.route__panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      panels.forEach(p => p.classList.toggle('is-active', p.dataset.mode === tab.dataset.mode));
    });
  });
}

function bindAddress() {
  const btn = document.getElementById('copyAddr');
  const hint = document.getElementById('copyHint');
  if (!btn) return;
  const ADDR = '제주특별자치도 제주시 탑동로 제주더큰내일센터 1층';
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(ADDR);
      hint.textContent = '주소를 복사했습니다.';
    } catch {
      hint.textContent = ADDR;
    }
    setTimeout(() => { hint.textContent = ''; }, 3000);
  });
}

function bindNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.querySelector('.nav__links');

  const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

function bindReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(i => i.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -60px 0px' });
  items.forEach(i => io.observe(i));

  /* 안전장치: 관찰자가 한 번도 반응하지 않으면(백그라운드 탭 등) 전부 보여줍니다 */
  setTimeout(() => {
    if (!document.querySelector('.reveal.is-in')) {
      items.forEach(i => i.classList.add('is-in'));
    }
  }, 1600);
}

/* -----------------------------------------------------------
   시작
   ----------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  bindMenuFilter();
  renderIdeas();
  renderMap();
  renderTimes();
  bindRouteTabs();
  bindAddress();
  bindNav();
  bindReveal();   // 동적으로 만든 카드까지 포함해야 하므로 마지막에 실행
});
