// dominik.js — Dominik (T14, T17, R010, R014)
// (1) Validacija kontakt forme  (2) Logika alternativnih objašnjenja

// ─── T17 / T18: KONTAKT FORMA VALIDACIJA (R014) ───────────────────────────

function validirajPolje(id, errorId, provjera, poruka) {
  const el = document.getElementById(id);
  const err = document.getElementById(errorId);
  if (el && !provjera(el.value)) {
    el.classList.add('input-error');
    err.textContent = poruka;
    return false;
  }
  if (el) { el.classList.remove('input-error'); err.textContent = ''; }
  return true;
}

function posaljiFormu() {
  let ok = true;
  ok = validirajPolje('ime', 'imeError', v => v.trim().length >= 2, 'Unesite ime i prezime.') && ok;
  ok = validirajPolje('email', 'emailError', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Unesite ispravnu e-mail adresu.') && ok;
  ok = validirajPolje('poruka', 'porukaError', v => v.trim().length >= 10, 'Poruka mora imati najmanje 10 znakova.') && ok;

  const gdpr = document.getElementById('gdpr');
  const gdprErr = document.getElementById('gdprError');
  if (!gdpr.checked) {
    gdprErr.textContent = 'Morate prihvatiti uvjete pohrane podataka.';
    ok = false;
  } else {
    gdprErr.textContent = '';
  }

  if (!ok) return;

  // Simulacija slanja (R014 — u produkciji: PHP mail() ili API)
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Šaljem...';

  // Spremi podatke lokalno radi prikaza (bez osobnih podataka u produkciji)
  const tip = document.querySelector('input[name="tip"]:checked')?.value || 'roditelj';
  console.log('Forma poslana:', { tip, vrijemeSlanja: new Date().toISOString() });

  setTimeout(() => {
    document.getElementById('formWrapper').hidden = true;
    document.getElementById('potvrda').hidden = false;
  }, 800);
}

// ─── T14: ALTERNATIVNA OBJAŠNJENJA (R010) ─────────────────────────────────
// Ova logika se koristi u chatbotu (jan/chatbot.js je poziva)
// Ovdje je definirana kao modul koji se može uvesti

const ALT_BAZA = {
  glagol: [
    "Zamislj film. Sve što se dogodi — to je glagol. Pas trči. Dijete spava.",
    "Glagol je radnja. Pitaj se: 'Što radi?' Na primjer: Mačka jede. 'Jede' je glagol.",
    "Glagol je kao motor rečenice. Bez glagola rečenica ne može voziti!"
  ],
  imenica: [
    "Imenica je ime za nešto. Sve što možeš dotaknuti ima ime. Stolica, knjiga, mačka.",
    "Zamislj sobu. Sve što vidiš ima ime. Ta imena su imenice!",
    "Imenica odgovara na pitanje 'Tko?' ili 'Što?'. Na primjer: Što je na stolu? Knjiga — imenica!"
  ],
  pridjev: [
    "Pridjev opisuje imenicu. Kakva je kuća? Velika. 'Velika' je pridjev.",
    "Zamislj sliku. Pridjev je boja, veličina ili oblik koji opisuješ. Plavo nebo, visoko drvo.",
    "Pridjev odgovara na pitanje 'Kakav?'. Na primjer: Kakav je pas? Smeđi. 'Smeđi' je pridjev!"
  ],
  default: [
    "Pokušajmo drugačije! Uzmi konkretni primjer iz svog života. Ja ću ti objasniti kroz njega.",
    "Zamislj da objašnjavaš to svom mlađem bratu ili sestri. Kako bi ti to rekao? Počni s tim.",
    "Dobro, vraćamo se na početak. Recite mi jednu rečenicu o toj temi, pa ćemo krenuti od tamo."
  ]
};

/**
 * Generiraj alternativno objašnjenje za zadanu temu (R010)
 * @param {string} tema - ključna tema (glagol, imenica, pridjev, default)
 * @param {number} pokusaj - koliko puta je već traženo (0-indexed)
 * @returns {string} alternativno objašnjenje
 */
function generirajAltObjasnjenje(tema, pokusaj = 0) {
  const lista = ALT_BAZA[tema] || ALT_BAZA.default;
  return lista[pokusaj % lista.length];
}

// Export za module (ako se koristi u build sustavu)
if (typeof module !== 'undefined') {
  module.exports = { generirajAltObjasnjenje, ALT_BAZA };
}
