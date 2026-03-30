const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "data", "quotas.json");

exports.listarQuotas = (req, res) => {
  try {
    if (!fs.existsSync(filePath)) return res.json([]);

    const raw = fs.readFileSync(filePath, "utf-8").trim();
    if (!raw) return res.json([]);

    const quotas = JSON.parse(raw);
    res.json(quotas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao ler quotas" });
  }
};