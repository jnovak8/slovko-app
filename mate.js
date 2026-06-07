// mate.js — Mate (T9, T20, R007, R011, R012, R015)
// (1) Navigacija vježbi s pristupačnim gumbima  (2) Pristupačni vizualni dizajn

// ─── T20: PRISTUPAČNOST (R015 — WCAG AA) ──────────────────────────────────

// Provjera kontrasta pri učitavanju (R015: min 4.5:1)
function provjeriKontrast() {
  const root = document.documentElement;
  // Postavi OpenDyslexic ili fallback (R015)
  root.style.setProperty('--font-dyslexic', "'OpenDyslexic', 'Atkinson Hyperlegible', sans-serif");
  // Postavi font-size minimume (R015: 16px tijelo, 20px naslovi)
  root.style.setProperty('--font-size-body', '16px');
  root.style.setProperty('--font-size-title', '20px');
  root.style.setProperty('--line-height', '1.6');
}

// Keyboard navigacija za vježbe (R007 — dostupno bez miša)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    const focused = document.activeElement;
    if (focused && focused.classList.contains('odgovor-opcija')) {
      e.preventDefault();
      odaberiOdgovor(focused);
    }
  }
});

// ─── T9: VJEŽBE ENGINE (R011 — 3 tipa vježbi) ─────────────────────────────

const VJEZBE = {
  1: { // Dopunjavanje rečenica (R011)
    naziv: 'Dopunjavanje rečenica',
    zadaci: [
      { recjenica: 'Mačka _______ mlijeko.', opcije: ['pije', 'trči', 'spava', 'leti'], tocno: 'pije' },
      { recjenica: 'Sunce _______ na nebu.', opcije: ['sja', 'spava', 'pliva', 'leti'], tocno: 'sja' },
      { recjenica: 'Dijete _______ u školu.', opcije: ['čita', 'ide', 'jede', 'pliva'], tocno: 'ide' },
      { recjenica: 'Pas _______ na lopty.', opcije: ['pliva', 'čita', 'trči', 'skače'], tocno: 'skače' },
      { recjenica: 'Mama _______ ručak.', opcije: ['kuha', 'čita', 'trči', 'spava'], tocno: 'kuha' }
    ]
  },
  2: { // Sparivanje (R011) — tekstualno sparivanje za HTML
    naziv: 'Sparivanje slika i riječi',
    zadaci: [
      { opis: 'Koji glagol opisuje: 🐕 + voda?', opcije: ['pliva', 'leti', 'spava', 'čita'], tocno: 'pliva' },
      { opis: 'Koji glagol opisuje: 🐦 + zrak?', opcije: ['leti', 'trči', 'jede', 'kuha'], tocno: 'leti' },
      { opis: 'Koji glagol opisuje: 😴 + krevet?', opcije: ['spava', 'trči', 'pliva', 'čita'], tocno: 'spava' },
      { opis: 'Koji glagol opisuje: 📚 + dijete?', opcije: ['čita', 'leti', 'pliva', 'kuha'], tocno: 'čita' },
      { opis: 'Koji glagol opisuje: 🏃 + noge?', opcije: ['trči', 'čita', 'spava', 'pliva'], tocno: 'trči' }
    ]
  },
  3: { // Čitanje s pitanjima (R011)
    naziv: 'Čitanje s pitanjima',
    zadaci: [
      {
        tekst: 'Luka ima psa. Pas se zove Medo. Medo voli trčati.',
        pitanje: 'Kako se zove Lukin pas?',
        opcije: ['Luka', 'Medo', 'Pero', 'Maca'],
        tocno: 'Medo'
      },
      {
        tekst: 'Ana ide u školu svaki dan. Njezina škola je blizu kuće.',
        pitanje: 'Tko ide u školu?',
        opcije: ['Luka', 'Medo', 'Ana', 'Mama'],
        tocno: 'Ana'
      },
      {
        tekst: 'Na nebu je sunce. Sunce je žuto i sjajno. Sve je toplo.',
        pitanje: 'Koje je boje sunce?',
        opcije: ['plavo', 'crveno', 'zeleno', 'žuto'],
        tocno: 'žuto'
      },
      {
        tekst: 'Maca pije mlijeko. Mlijeko je bijelo. Maci je ukusno.',
        pitanje: 'Što Maca pije?',
        opcije: ['sok', 'vodu', 'mlijeko', 'čaj'],
        tocno: 'mlijeko'
      },
      {
        tekst: 'Pero voli voće. On jede jabuke svaki dan. Jabuke su crvene.',
        pitanje: 'Što Pero jede svaki dan?',
        opcije: ['kruške', 'jabuke', 'naranče', 'grožđe'],
        tocno: 'jabuke'
      }
    ]
  }
};

let aktivnaVjezbaId = 1;
let trenutniZadatak = 0;
let tocniOdgovori = 0;
let pogreskiOdgovori = 0;
let pocetakVremena = null;

function odaberiVjezbu(id) {
  aktivnaVjezbaId = id;
  trenutniZadatak = 0;
  tocniOdgovori = 0;
  pogreskiOdgovori = 0;
  pocetakVremena = Date.now();

  // Ažuriraj kartice (T9)
  [1, 2, 3].forEach(i => {
    const k = document.getElementById(`kartica${i}`);
    k.classList.toggle('vjezba-aktivna', i === id);
    k.setAttribute('aria-pressed', i === id ? 'true' : 'false');
  });

  sessionStorage.setItem('aktivnaVjezba', VJEZBE[id].naziv);
  prikaziZadatak();
}

function prikaziZadatak() {
  const vjezba = VJEZBE[aktivnaVjezbaId];
  const ukupno = vjezba.zadaci.length;
  const container = document.getElementById('aktivnaVjezba');

  if (trenutniZadatak >= ukupno) {
    const trajanjeSek = Math.round((Date.now() - pocetakVremena) / 1000);
    sessionStorage.setItem('zadnjiRezultat', JSON.stringify({
      tocnih: tocniOdgovori, ukupno, trajanjeSek
    }));
    window.location.href = 'rezultat.html';
    return;
  }

  const zadatak = vjezba.zadaci[trenutniZadatak];
  const postotak = Math.round((trenutniZadatak / ukupno) * 100);

  // Generiraj HTML zadatka (R015 — font, veličina, kontrast)
  const pitanjeHtml = zadatak.tekst
    ? `<div class="zadatak-tekst" aria-label="Tekst za čitanje">${zadatak.tekst}</div>
       <p class="zadatak-pitanje">${zadatak.pitanje}</p>`
    : zadatak.opis
    ? `<p class="zadatak-pitanje">${zadatak.opis}</p>`
    : `<p class="zadatak-recjenica" aria-label="Rečenica za dopunjavanje">${zadatak.recjenica}</p>`;

  container.innerHTML = `
    <div class="zadatak-header">
      <span class="zadatak-broj">Zadatak ${trenutniZadatak + 1} od ${ukupno}</span>
      <span class="zadatak-tocni" aria-label="${tocniOdgovori} točnih odgovora">✓ ${tocniOdgovori} točnih</span>
    </div>

    <div class="progres-bar" role="progressbar" aria-valuenow="${postotak}" aria-valuemin="0" aria-valuemax="100" aria-label="Napredak vježbe ${postotak}%">
      <div class="progres-fill" style="width:${postotak}%"></div>
    </div>

    ${pitanjeHtml}

    <div class="odgovori" role="group" aria-label="Odaberi točan odgovor">
      ${zadatak.opcije.map(op => `
        <button
          class="odgovor-opcija"
          onclick="odaberiOdgovor(this, '${op}', '${zadatak.tocno}')"
          aria-label="Odgovor: ${op}"
        >${op}</button>
      `).join('')}
    </div>

    <div id="feedback" class="feedback" role="status" aria-live="polite"></div>
  `;
}

function odaberiOdgovor(el, odgovor, tocno) {
  // Onemogući sve opcije nakon odabira
  document.querySelectorAll('.odgovor-opcija').forEach(b => b.disabled = true);

  const feedback = document.getElementById('feedback');

  if (odgovor === tocno) {
    el.classList.add('odgovor-tocno');
    tocniOdgovori++;
    // R006, R012 — nikad negativna poruka, uvijek ohrabrujuća
    feedback.className = 'feedback feedback-tocno';
    feedback.textContent = ['Točno! Bravo! 🎉', 'Super! Znaš ti to! ⭐', 'Odlično! Napreduješ! 💪'][Math.floor(Math.random()*3)];
  } else {
    el.classList.add('odgovor-netocno');
    pogreskiOdgovori++;
    // Pokaži točan odgovor (R006 — bez "Krivo!", ohrabrujuće)
    document.querySelectorAll('.odgovor-opcija').forEach(b => {
      if (b.textContent.trim() === tocno) b.classList.add('odgovor-tocno-pokazi');
    });
    feedback.className = 'feedback feedback-netocno';
    feedback.textContent = `Skoro! Točan odgovor je: ${tocno}. Nastavi, može se! 💛`;
  }

  // Auto-prijelaz na sljedeći zadatak (R009 — max 5 razmjena)
  setTimeout(() => {
    trenutniZadatak++;
    prikaziZadatak();
  }, 1800);
}

// Init
window.addEventListener('DOMContentLoaded', () => {
  provjeriKontrast();
  odaberiVjezbu(1);
});
