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

// --------- helpers ---------

async function loadStatus() {
  try {
    const data = await fs.readJson(STATUS_FILE);
    if (!data.products) data.products = {};
    return data;
  } catch {
    return { products: {} };
  }
}

async function saveStatus(status) {
  await fs.writeJson(STATUS_FILE, status, { spaces: 2 });
}

// --------- routing ---------

// Strona główna – oferta
app.get("/", async (req, res) => {
  const status = await loadStatus();
  const products = status.products || {};
  res.render("index", { products });
});

// Panel admina
app.get("/admin", async (req, res) => {
  const status = await loadStatus();
  const products = status.products || {};
  const error = req.session.loginError;
  req.session.loginError = null;

  res.render("admin", {
    loggedIn: req.session.isAdmin,
    products,
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

// Aktualizacja danych produktu (tytuł, cena, opis, button, hidden, unavailable)
app.post("/update", async (req, res) => {
  if (!req.session.isAdmin)
    return res.status(401).json({ error: "Brak autoryzacji" });

  const { id, data } = req.body;
  if (!id || !data) {
    return res.status(400).json({ error: "Brak id lub danych" });
  }

  try {
    const status = await loadStatus();
    if (!status.products[id]) status.products[id] = {};

    // Prosta aktualizacja pól
    Object.assign(status.products[id], data);

    await saveStatus(status);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Błąd zapisu status.json" });
  }
});

// Usuwanie produktu
app.post("/delete", async (req, res) => {
  if (!req.session.isAdmin)
    return res.status(401).json({ error: "Brak autoryzacji" });

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Brak id" });

  try {
    const status = await loadStatus();
    if (status.products[id]) {
      delete status.products[id];
      await saveStatus(status);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Błąd zapisu status.json" });
  }
});

// Dodawanie nowego produktu (puste pola)
app.post("/add", async (req, res) => {
  if (!req.session.isAdmin)
    return res.status(401).json({ error: "Brak autoryzacji" });

  try {
    const status = await loadStatus();
    const products = status.products || {};

    // prosty generator id: product-N
    const ids = Object.keys(products)
      .map(k => {
        const m = k.match(/^product-(\d+)$/);
        return m ? parseInt(m[1], 10) : null;
      })
      .filter(n => n !== null);
    const max = ids.length ? Math.max(...ids) : 0;
    const newId = `product-${max + 1}`;

    products[newId] = {
      title: "",
      price: "",
      features: [],
      buttonText: "Wybierz pakiet",
      hidden: false,
      unavailable: false
    };

    status.products = products;
    await saveStatus(status);

    res.json({ ok: true, id: newId });
  } catch (err) {
    res.status(500).json({ error: "Błąd zapisu status.json" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serwer działa na http://localhost:${PORT}`);
});
