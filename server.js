const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Ustawienia EJS i folder publiczny
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Dane usług — zintegrowane z grafikami
const services = [
  {
    title: '🔒 Bot Anty-Nuke',
    price: '10 zł',
    features: [
      'Licencja na 1 serwer Discord',
      'Ochrona przed raid/nuke',
      'Anty-usuwanie kanałów i ról',
      'Whitelist właściciela',
      'Backup + logi',
      'Slash komendy',
      'Podstawowa ochrona'
    ],
    button: 'Zabezpiecz Teraz'
  },
  {
    title: '🌐 Własna Strona WWW',
    price: '15–25 zł',
    features: [
      'Nowoczesny design',
      'Responsywny layout',
      'Szybkie ładowanie',
      'Pełna personalizacja',
      'Hosting w cenie (opcja)'
    ],
    button: 'Zamów Stronę'
  },
  {
    title: '🎮 Pluginy Minecraft',
    price: '15–25 zł',
    features: [
      'Pluginy na zamówienie',
      'Spigot / Paper / Bukkit',
      'Ekonomia, minigry, systemy',
      'Optymalizacja wydajności',
      'Pełna dokumentacja'
    ],
    button: 'Zamów Plugin'
  },
  {
    title: '⚙️ Podstawowa Konfiguracja',
    price: '15–30 zł',
    features: [
      'Bot z podstawowymi funkcjami',
      'Moderacja i muzyka',
      'Konfiguracja pod serwer',
      'Wsparcie 48h'
    ],
    button: 'Zamów Teraz'
  },
  {
    title: '🛠️ Pakiet Serwer DC',
    price: '25–50 zł',
    features: [
      'Pełna konfiguracja serwera',
      'Wszystkie boty + backup',
      'Role, kanały, permisje',
      'Bonus: banner + ikona'
    ],
    button: 'Wybierz Pakiet'
  },
  {
    title: '🤖 Bot Autorski',
    price: '40–130 zł',
    features: [
      'Napisany od podstaw',
      'Ekonomia, gry, API',
      'Panel web (opcja)',
      'Pełne prawa + kod'
    ],
    button: 'Zapytaj o Szczegóły'
  }
];

// Routing główny
app.get('/', (req, res) => {
  res.render('index', { services });
});

// Routing testowy JSON (opcjonalny)
app.get('/api/services', (req, res) => {
  res.json(services);
});

// Start serwera
app.listen(port, () => {
  console.log(`QD Studio działa na http://localhost:${port}`);
});
