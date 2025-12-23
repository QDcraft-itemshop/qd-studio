const express = require("express");
const session = require("express-session");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD = "qd-admin-2025";
const ADMIN_LOGIN = "qdstudio";

const STATUS_FILE = path.join(__dirname, "status.json");

// EJS + PUBLIC
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesje
app.use(
  session({
    secret: "super-secret-session-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  })
);

// Produkty widoczne w panelu
const PRODUCTS = [
  { id: "product-1", title: "Podstawowa Konfiguracja" },
  { id: "product-2", title: "Pakiet Serwer DC" },
  { id: "product-3", title: "Bot Autorski" },
  { id: "product-4", title: "Bot Anty-Nuke" },
  { id: "product-5", title: "Własna Strona WWW" },
  { id: "product-6", title: "Pluginy Minecraft" },
  { id: "product-7", title: "Skrypt FiveM" },
  { id: "product-9", title: "Ranga Premium" },
  { id: "product-10", title: "Ranga Premium Plus" },
  { id: "product-11", title: "Ranga Premium Ultra" }
];

// Dane usług (opisy + ceny z grafik)
const SERVICES = [
  {
    title: "Podstawowa Konfiguracja",
    price: "15–30 zł",
    features: [
      "Bot z podstawowymi funkcjami",
      "Moderacja i muzyka",
      "Konfiguracja pod serwer",
      "Wsparcie 48h"
    ],
    button: "Zamów Teraz"
  },
  {
    title: "Pakiet Serwer DC",
    price: "25–50 zł",
    features: [
      "Pełna konfiguracja serwera",
      "Wszystkie boty + backup",
      "Role, kanały, permisje",
      "Bonus: banner + ikona"
    ],
    button: "Wybierz Pakiet"
  },
  {
    title: "Bot Autorski",
    price: "40–130 zł",
    features: [
      "Napisany od podstaw",
      "Ekonomia, gry, API",
      "Panel web (opcja)",
      "Pełne prawa + kod"
    ],
    button: "Zapytaj o Szczegóły"
  },
  {
    title: "Bot Anty-Nuke",
    price: "10 zł",
    features: [
      "Licencja na 1 serwer Discord",
      "Ochrona przed raid/nuke",
      "Anty-usuwanie kanałów i ról",
      "Whitelist właściciela",
      "Backup + logi",
      "Slash komendy",
      "Podstawowa ochrona"
    ],
    button: "Zabezpiecz Teraz"
  },
  {
    title: "Własna Strona WWW",
    price: "15–25 zł",
    features: [
      "Nowoczesny design",
      "Responsywny layout",
      "Szybkie ładowanie",
      "Pełna personalizacja",
      "Hosting w cenie (opcja)"
    ],
    button: "Zamów Stronę"
  },
  {
    title: "Pluginy Minecraft",
    price: "15–25 zł",
    features: [
      "Pluginy na zamówienie",
      "Spigot / Paper / Bukkit",
      "Ekonomia, minigry, systemy",
      "Optymalizacja wydajności",
      "Pełna dokumentacja"
    ],
    button: "Zamów Plugin"
  }
];

// ---------------------- ROUTING ----------------------

// Strona główna
app.get("/", async (req, res) => {
  const status = await fs.readJson(STATUS_FILE);
  res.render("index", {
    products: PRODUCTS,
    status,
    services: SERVICES
  });
});

// Panel admina
app.get("/admin", async (req, res) => {
  const status = await fs.readJson(STATUS_FILE);
  const error = req.session.loginError;
  req.session.loginError = null;

  res.render("admin", {
    loggedIn: req.session.isAdmin,
    products: PRODUCTS,
    status,
    error
  });
});

// Logowanie
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    req.session.loginError = null;
    return res.redirect("/admin");
  }

  req.session.loginError = "❌ Niepoprawny login lub hasło.";
  res.redirect("/admin");
});

// Wylogowanie
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin");
  });
});

// Aktualizacja status.json
app.post("/update", async (req, res) => {
  if (!req.session.isAdmin)
    return res.status(401).json({ error: "Brak autoryzacji" });

  const { data } = req.body;

  try {
    const current = await fs.readJson(STATUS_FILE);

    for (const id in data) {
      if (!current[id]) current[id] = {};
      Object.assign(current[id], data[id]);
    }

    await fs.writeJson(STATUS_FILE, current, { spaces: 2 });
    res.json({ ok: true });

  } catch (err) {
    res.status(500).json({ error: "Błąd zapisu status.json" });
  }
});

// Start serwera
app.listen(PORT, () => {
  console.log(`✅ Serwer działa na http://localhost:${PORT}`);
});
