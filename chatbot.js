// chatbot.js — Jan (T12, R009, R010, R016)
// Chatbot logika: odgovori, detekcija ključnih riječi, S2 indikator, S5 završetak

// Baza odgovora (R009 — 3 scenarija, R016 — max 3 rečenice, SVO)
const ODGOVORI = {
  pozdrav: [
    "Bok! Ja sam Lako. Mogu ti pomoći sa školskim zadacima. Što bi htio naučiti danas?"
  ],
  glagol: [
    "Glagol je riječ koja opisuje radnju. Na primjer: trčati, jesti, spavati. Što radiš sada?",
    "Glagol govori što netko radi. Primjer: Pas trči. 'Trči' je glagol. Možeš mi reći rečenicu, pa ćemo pronaći glagol zajedno."
  ],
  imenica: [
    "Imenica je naziv za osobu, životinju, stvar ili mjesto. Na primjer: Luka, mačka, stolica, grad. Možeš mi reći nešto iz učionice, pa ćemo pronaći imenicu."
  ],
  pridjevi: [
    "Pridjev opisuje imenicu. Na primjer: velika kuća, zelena trava, brzi pas. Kakva je tvoja torba?"
  ],
  lektira: [
    "Lektira je knjiga koju čitaš za školu. Možeš mi ukratko ispričati o čemu govori. Pokušat ću ti objasniti jednostavno."
  ],
  matematika: [
    "Matematika je zabavna! Koji zadatak ti nije jasan? Napiši mi ga i riješit ćemo ga korak po korak."
  ],
  default: [
    "Razumijem te! Možeš mi napisati više o tome što ne razumiješ. Pomoći ću ti korak po korak.",
    "Dobro pitanje! Reci mi još malo o tome. Objasnit ću ti na jednostavan način."
  ]
};

// Alternativna objašnjenja za ključne riječi (R010)
const ALT_OBJASNJENJA = {
  glagol: "Zamislj da gledaš film. Sve što se dogodi — to je glagol. Pas trči. Dijete spava. 'Trči' i 'spava' su glagoli!",
  imenica: "Imenica je ime za nešto. Sve što možeš dotaknuti ili vidjeti ima ime. Stolica, knjiga, prijatelj — to su imenice.",
  default: "Pokušajmo ovako: zamislj konkretnu sliku. Ja ću ti opisati primjerom iz svakodnevnog života. Pitaj me što god hoćeš!"
};

// Ohrabrujuće završne poruke S5 (R006, R012)
const ZAVRSETCI = [
  "Baš si pametan! Pitaš prava pitanja i to je super. Svaki put naučiš nešto novo.",
  "Odlično si se trudio! Svaki razgovor te čini pametnijim. Vidimo se uskoro!",
  "Super posao! Postavljanje pitanja je prvi korak do razumijevanja. Bravo!"
];

let brRazmjena = 0;
let zadnjaTema = null;
let sesijaPodaci = JSON.parse(sessionStorage.getItem('sesija') || '{"poruke":0,"pocetak":Date.now()}');

function detektirajTemu(tekst) {
  const t = tekst.toLowerCase();
  if (t.includes('glagol')) return 'glagol';
  if (t.includes('imenica')) return 'imenica';
  if (t.includes('pridjev')) return 'pridjevi';
  if (t.includes('lektira') || t.includes('knjiga') || t.includes('pročitao') || t.includes('procitao')) return 'lektira';
  if (t.includes('matem') || t.includes('broj') || t.includes('zbrajanje') || t.includes('oduzimanje')) return 'matematika';
  return 'default';
}

function jeKljucnaRijec(tekst) {
  const t = tekst.toLowerCase();
  return t.includes('ne razumijem') || t.includes('ponovi') || t.includes('objasni drugačije') ||
         t.includes('objasni drugacije') || t.includes('ne znam') || t.includes('kako');
}

function generirajtOdgovor(tekst) {
  if (jeKljucnaRijec(tekst)) {
    // R010 — alternativno objašnjenje
    const alt = ALT_OBJASNJENJA[zadnjaTema] || ALT_OBJASNJENJA.default;
    return { tekst: alt, jeAlt: true };
  }
  const tema = detektirajTemu(tekst);
  zadnjaTema = tema;
  const odg = ODGOVORI[tema] || ODGOVORI.default;
  return { tekst: odg[Math.floor(Math.random() * odg.length)], jeAlt: false };
}

function dodajPoruku(tekst, tip, jeAlt = false) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `msg msg-${tip}${jeAlt ? ' msg-alt' : ''}`;

  if (tip === 'bot') {
    div.innerHTML = `
      <div class="bot-avatar bot-avatar-sm" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="60" fill="#9FE1CB"/>
          <rect x="34" y="38" width="52" height="42" rx="10" fill="#085041"/>
          <rect x="43" y="50" width="14" height="14" rx="4" fill="#E1F5EE"/>
          <circle cx="50" cy="57" r="4" fill="#1D9E75"/>
          <rect x="63" y="50" width="14" height="14" rx="4" fill="#E1F5EE"/>
          <circle cx="70" cy="57" r="4" fill="#1D9E75"/>
          <path d="M47 72 Q60 80 73 72" fill="none" stroke="#E1F5EE" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="msg-bubble">${tekst}</div>`;
  } else {
    div.innerHTML = `<div class="msg-bubble">${tekst}</div>`;
  }

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function prikaziIndikator() {
  // S2 — indikator učitavanja (R019)
  const container = document.getElementById('chatMessages');
  const ind = document.createElement('div');
  ind.className = 'msg msg-bot';
  ind.id = 'typingIndicator';
  ind.setAttribute('aria-label', 'Lako razmišlja');
  ind.innerHTML = `
    <div class="bot-avatar bot-avatar-sm" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="60" fill="#9FE1CB"/>
        <rect x="34" y="38" width="52" height="42" rx="10" fill="#085041"/>
        <path d="M47 72 Q60 80 73 72" fill="none" stroke="#E1F5EE" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </div>
    <div class="msg-bubble typing-indicator">
      <span></span><span></span><span></span>
    </div>`;
  container.appendChild(ind);
  container.scrollTop = container.scrollHeight;

  // Status header
  document.getElementById('botStatus').textContent = '⏳ Razmišlja...';
}

function ukloniIndikator() {
  const ind = document.getElementById('typingIndicator');
  if (ind) ind.remove();
  document.getElementById('botStatus').textContent = '● Dostupan';
}

function prikaziZavrsetak() {
  // S5 — završna poruka (R006, R012)
  const zavrsetak = ZAVRSETCI[Math.floor(Math.random() * ZAVRSETCI.length)];
  dodajPoruku(zavrsetak, 'bot');

  // Gumbi za S5 → S1 ili END
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'session-end-btns';
  div.innerHTML = `
    <p>Što želiš sada?</p>
    <button class="btn btn-primary" onclick="novoRazgovor()">Novo pitanje</button>
    <a href="index.html" class="btn btn-secondary">Zatvori</a>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;

  document.getElementById('chatInput').disabled = true;
  document.getElementById('sendBtn').disabled = true;
}

function novoRazgovor() {
  brRazmjena = 0;
  zadnjaTema = null;
  document.getElementById('chatMessages').innerHTML = '';
  document.getElementById('chatInput').disabled = false;
  document.getElementById('sendBtn').disabled = false;
  dodajPoruku("Super! O čemu ćemo razgovarati ovaj put?", 'bot');
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const tekst = input.value.trim();
  if (!tekst) return;

  input.value = '';
  dodajPoruku(tekst, 'user');
  brRazmjena++;

  // Spremi u sessionStorage (R013 priprema)
  sesijaPodaci.poruke = (sesijaPodaci.poruke || 0) + 1;
  sessionStorage.setItem('sesija', JSON.stringify(sesijaPodaci));

  // Onemogući input za S2
  input.disabled = true;
  document.getElementById('sendBtn').disabled = true;

  prikaziIndikator();

  // Simulacija < 3 sek odgovora (R019)
  await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

  ukloniIndikator();

  // R009 — max 5 razmjena po sesiji, a onda S5
  if (brRazmjena >= 5) {
    prikaziZavrsetak();
    return;
  }

  const odg = generirajtOdgovor(tekst);
  dodajPoruku(odg.tekst, 'bot', odg.jeAlt);

  input.disabled = false;
  document.getElementById('sendBtn').disabled = false;
  input.focus();
}

function sendQuick(tekst) {
  document.getElementById('chatInput').value = tekst;
  sendMessage();
}

// Enter tipka
document.getElementById('chatInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
