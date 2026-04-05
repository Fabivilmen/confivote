const fs = require("fs");
const path = require("path");

const votosPath = path.join(__dirname, "../../data/votos.json");

function lerJson(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function salvarJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// RESET COMPLETO
exports.resetSessao = (req, res) => {
  try {
    const assembleiaId = Number(req.query.assembleiaId);

    let votos = lerJson(votosPath);

    votos = votos.filter(v =>
      Number(v.assembleiaId) !== assembleiaId
    );

    salvarJson(votosPath, votos);

    res.json({ ok: true });

  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
};