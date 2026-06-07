// vigo.js — Vigo (T15, T16, R006, R012)
// (1) Prikaz rezultata vježbe  (2) Ohrabrujuće poruke, nikad negativne

// ─── T15/T16: MODEL POVRATNIH INFORMACIJA (R006, R012) ────────────────────

// Pohvalne poruke prema postotku (NIKAD negativne — R006)
const POHVALE = {
  visoka: [ // 80-100%
    "Izvrsno! Ti si pravi šampion čitanja! 🏆",
    "Nevjerojatno! Toliko znaš — to je super! ⭐",
    "Bravo! Trudiš se i to se vidi. Tako se napreduje! 🌟"
  ],
  srednja: [ // 50-79%
    "Odlično si se trudio! Svaki put naučiš nešto novo. 💪",
    "Super posao! Korak po korak do cilja. Baš si vrijedan! 😊",
    "Lijepo! Napreduješ svaki put. Nastavi tako! 🎉"
  ],
  niska: [ // ispod 50% — ohrabrujuće, ponuda ponavljanja (R012)
    "Ima mjesta za rast — i to je u redu! Pokušaj još jednom, znaš ti to! 💛",
    "Pitanja su bila teška, ali si ih probao! To je hrabrost. Pokušajmo opet! 🌱",
    "Nemaš razloga brinuti. Svaki pokušaj je korak naprijed! 🙌"
  ]
};

function dohvatiPohvalu(postotak) {
  if (postotak >= 80) return POHVALE.visoka[Math.floor(Math.random() * POHVALE.visoka.length)];
  if (postotak >= 50) return POHVALE.srednja[Math.floor(Math.random() * POHVALE.srednja.length)];
  return POHVALE.niska[Math.floor(Math.random() * POHVALE.niska.length)];
}

function izracunajZvjezdice(postotak) {
  if (postotak >= 90) return 5;
  if (postotak >= 70) return 4;
  if (postotak >= 50) return 3;
  if (postotak >= 30) return 2;
  return 1;
}

function prikaziRezultat(tocnih, ukupno, trajanjeSek) {
  const postotak = Math.round((tocnih / ukupno) * 100);
  const zvjezdice = izracunajZvjezdice(postotak);
  const minuta = Math.floor(trajanjeSek / 60);
  const sekunde = trajanjeSek % 60;
  const trajanjeTekst = minuta > 0
    ? `${minuta} min${sekunde > 0 ? ` ${sekunde} sek` : ''}`
    : `${sekunde} sek`;

  // R012 — "X od Y točnih"
  document.getElementById('rezultatNaslov').textContent = `${tocnih} od ${ukupno} točnih`;
  document.getElementById('metrikaTocnost').textContent = `${postotak}%`;
  document.getElementById('metrikaTrajanje').textContent = trajanjeTekst;
  document.getElementById('metrikaZvjezdice').textContent = `+${zvjezdice} ${'⭐'.repeat(Math.min(zvjezdice, 3))}`;

  // Ohrabrujuća poruka (R006 — NIKAD negativna)
  document.getElementById('rezultatPohvala').textContent = dohvatiPohvalu(postotak);

  // Ponuda ponavljanja ispod 50% (R012)
  if (postotak < 50) {
    document.getElementById('ponudaPonavljanja').hidden = false;
  }

  // Animacija ikone prema rezultatu
  const ikona = document.querySelector('.rezultat-icon');
  if (postotak >= 80) ikona.textContent = '🏆';
  else if (postotak >= 50) ikona.textContent = '⭐';
  else ikona.textContent = '💛';

  // Spremi u sessionStorage za roditeljski dashboard (R013)
  const prethodniRezultati = JSON.parse(sessionStorage.getItem('rezultati') || '[]');
  prethodniRezultati.push({
    datum: new Date().toLocaleDateString('hr-HR'),
    tocnih, ukupno, postotak, trajanjeSek,
    vjezba: sessionStorage.getItem('aktivnaVjezba') || 'Nepoznata vježba'
  });
  sessionStorage.setItem('rezultati', JSON.stringify(prethodniRezultati));
}

function ponovi() {
  window.location.href = 'vjezbe.html';
}

// Učitaj rezultat iz sessionStorage (proslijedi ga vjezbe.js → rezultat.html)
window.addEventListener('DOMContentLoaded', () => {
  const podaci = JSON.parse(sessionStorage.getItem('zadnjiRezultat') || 'null');
  if (podaci) {
    prikaziRezultat(podaci.tocnih, podaci.ukupno, podaci.trajanjeSek);
  } else {
    // Demo podaci ako nema sessionStorage podataka
    prikaziRezultat(7, 10, 240);
  }
});
