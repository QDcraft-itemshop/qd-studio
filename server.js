const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = "qd-admin-2025";
const STATUS_FILE = path.join(__dirname, "status.json");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/status", async (req, res) => {
  try {
    const data = await fs.readJson(STATUS_FILE);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Nie można odczytać status.json" });
  }
});

app.post("/update", async (req, res) => {
  const { password, data } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Niepoprawne hasło" });
  }

  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    await fs.writeJson(STATUS_FILE, parsed, { spaces: 2 });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Błąd zapisu status.json" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serwer działa na http://localhost:${PORT}`);
});
