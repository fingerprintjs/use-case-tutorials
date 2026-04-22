// --- State ---
let allRentals = [];
let hotRentals = [];
const activeTypes = new Set();
const activeAmenities = new Set();
let minGuests = null;
let minBedrooms = null;
let maxPrice = 1000;
let searchQuery = '';
let debounceTimer = null;

// --- Constants ---

const TYPE_GRADIENTS = {
  'Entire home':  'from-blue-400 to-indigo-500',
  'Apartment':    'from-violet-400 to-purple-500',
  'Private room': 'from-rose-300 to-pink-500',
  'Cabin':        'from-amber-400 to-orange-500',
  'Villa':        'from-emerald-400 to-teal-500',
  'Beach house':  'from-cyan-400 to-sky-500',
};

const TYPE_ICONS = {
  'Entire home':  '🏠',
  'Apartment':    '🏢',
  'Private room': '🛏️',
  'Cabin':        '🪵',
  'Villa':        '🏡',
  'Beach house':  '🏖️',
};

const MAX_PRICE_CEILING = 1000;

// Pill classes — category strip (icon+label, taller)
const CAT_OFF = 'filter-pill shrink-0 flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-xs font-medium border border-slate-200 bg-white text-slate-500 cursor-pointer hover:border-teal-400 hover:text-teal-600 transition-colors';
const CAT_ON  = 'filter-pill shrink-0 flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-xs font-medium border border-teal-500 bg-teal-50 text-teal-700 cursor-pointer transition-colors';

// Pill classes — filter panel (compact)
const PILL_OFF = 'filter-pill px-3 py-1 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-600 cursor-pointer hover:border-teal-400 transition-colors';
const PILL_ON  = 'filter-pill px-3 py-1 rounded-lg text-xs font-medium border border-teal-500 bg-teal-500 text-white cursor-pointer transition-colors';

// --- Utilities ---
function formatPrice({ pricePerNight }) {
  return `$${Math.round(pricePerNight)}`;
}

// --- Rental card (grid tile) ---
function createCard(rental) {
  const el = document.createElement('article');
  el.className = 'bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-150 cursor-pointer';

  const grad = TYPE_GRADIENTS[rental.type] ?? 'from-slate-400 to-slate-600';
  const icon = TYPE_ICONS[rental.type] ?? '🏠';

  const visibleAmenities = rental.amenities.slice(0, 3);
  const extraCount = rental.amenities.length - visibleAmenities.length;

  el.innerHTML = `
    <div class="h-44 relative overflow-hidden">
      <img src="/images/${rental.id}.jpeg" alt="${rental.name}" class="w-full h-full object-cover" />
      <span class="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-full">
        ${icon} ${rental.type}
      </span>
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
        <p class="text-xs text-white/90">${rental.city}, ${rental.country}</p>
      </div>
    </div>
    <div class="p-3">
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-semibold text-slate-800 text-sm leading-snug line-clamp-1 flex-1">${rental.name}</h3>
        <div class="shrink-0 text-right">
          <span class="text-sm font-bold text-teal-600">${formatPrice(rental)}</span>
          <span class="text-xs text-slate-400">/night</span>
        </div>
      </div>
      <div class="flex items-center gap-1 mt-0.5">
        <span class="text-xs text-amber-500 font-medium">★ ${rental.rating.toFixed(1)}</span>
        <span class="text-xs text-slate-400">(${rental.reviewCount})</span>
        <span class="text-slate-200 mx-1">·</span>
        <span class="text-xs text-slate-500">${rental.guests} guests · ${rental.bedrooms} bed${rental.bedrooms !== 1 ? 's' : ''}</span>
      </div>
      <div class="mt-2 flex gap-1 flex-wrap">
        ${visibleAmenities.map((a) => `<span class="text-xs px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">${a}</span>`).join('')}
        ${extraCount > 0 ? `<span class="text-xs px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400">+${extraCount}</span>` : ''}
      </div>
    </div>
  `;

  return el;
}

// --- Filtering ---
function getFiltered() {
  return allRentals.filter((r) => {
    if (activeTypes.size > 0 && !activeTypes.has(r.type)) return false;
    if (minGuests !== null && r.guests < minGuests) return false;
    if (minBedrooms !== null && r.bedrooms < minBedrooms) return false;
    if (maxPrice < MAX_PRICE_CEILING && r.priceUSD > maxPrice) return false;
    if (activeAmenities.size > 0) {
      for (const a of activeAmenities) {
        if (!r.amenities.includes(a)) return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hay = `${r.name} ${r.city} ${r.country} ${r.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// --- Render: Hot Rentals (backend-selected, unaffected by filters) ---
function renderHotRentals() {
  const grid = document.getElementById('hotRentalsGrid');
  grid.innerHTML = '';
  for (const rental of hotRentals) {
    grid.appendChild(createCard(rental));
  }
}

// --- Render: All Rentals ---
function render() {
  const rentals = getFiltered();

  document.getElementById('rentalCount').textContent =
    `${rentals.length} result${rentals.length !== 1 ? 's' : ''}`;

  const listEl  = document.getElementById('rentalsList');
  const emptyEl = document.getElementById('emptyState');
  listEl.innerHTML = '';

  if (rentals.length === 0) {
    emptyEl.classList.remove('hidden');
    listEl.classList.add('hidden');
  } else {
    emptyEl.classList.add('hidden');
    listEl.classList.remove('hidden');
    for (const rental of rentals) listEl.appendChild(createCard(rental));
  }
}

// --- Filter pills ---
document.querySelectorAll('.filter-pill').forEach((btn) => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    const isCategory = filter === 'type' && btn.closest('header') !== null;
    const val = (filter === 'guests' || filter === 'bedrooms')
      ? Number(btn.dataset.value)
      : btn.dataset.value;

    if (filter === 'type') {
      if (activeTypes.has(val)) {
        activeTypes.delete(val);
        btn.className = isCategory ? CAT_OFF : PILL_OFF;
      } else {
        activeTypes.add(val);
        btn.className = isCategory ? CAT_ON : PILL_ON;
      }
    } else if (filter === 'amenity') {
      if (activeAmenities.has(val)) {
        activeAmenities.delete(val);
        btn.className = PILL_OFF;
      } else {
        activeAmenities.add(val);
        btn.className = PILL_ON;
      }
    } else if (filter === 'guests') {
      if (minGuests === val) {
        minGuests = null;
        btn.className = PILL_OFF;
      } else {
        minGuests = val;
        document.querySelectorAll('[data-filter="guests"]').forEach((b) => { b.className = PILL_OFF; });
        btn.className = PILL_ON;
      }
    } else if (filter === 'bedrooms') {
      if (minBedrooms === val) {
        minBedrooms = null;
        btn.className = PILL_OFF;
      } else {
        minBedrooms = val;
        document.querySelectorAll('[data-filter="bedrooms"]').forEach((b) => { b.className = PILL_OFF; });
        btn.className = PILL_ON;
      }
    }

    render();
  });
});

// --- Price slider ---
const priceSlider = document.getElementById('priceSlider');
const priceLabel  = document.getElementById('priceLabel');

priceSlider.addEventListener('input', () => {
  maxPrice = Number(priceSlider.value);
  priceLabel.textContent = maxPrice >= MAX_PRICE_CEILING ? 'Any price' : `$${maxPrice}/night`;
  render();
});

// --- Search ---
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchQuery = e.target.value.trim();
    render();
  }, 300);
});

// --- Welcome back banner ---
document.getElementById('dismissBanner').addEventListener('click', () => {
  document.getElementById('welcomeBanner').classList.add('hidden');
});

// --- Reset demo ---
document.getElementById('resetBtn').addEventListener('click', async () => {
  try {
    await fetch('/api/reset', { method: 'POST' });
  } finally {
    window.location.reload();
  }
});

// --- Init ---
async function init() {
  try {
    const res = await fetch('/api/rentals');
    const data = await res.json();
    allRentals = data.rentals ?? [];
    hotRentals = data.hotRentals ?? [];

    if (data.isReturnVisitor) {
      document.getElementById('welcomeBanner').classList.remove('hidden');
    }

    document.getElementById('loadingState').classList.add('hidden');
    renderHotRentals();
    render();
  } catch (err) {
    console.error('Failed to load rentals:', err);
    document.getElementById('loadingState').innerHTML =
      '<p class="col-span-3 text-center text-slate-400 py-10 text-sm">Failed to load rentals. Is the server running?</p>';
  }
}

init();
