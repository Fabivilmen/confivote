const fs = require("fs");
const path = require("path");

const tokensPath = path.join(__dirname, "../data/tokens.json");

/* VALIDAR TOKEN */
exports.validarToken = (req, res) => {

  const { token } = req.query;

  if (!token) {
    return res.json({ valido: false });
  }

  if (!fs.existsSync(tokensPath)) {
    return res.json({ valido: false });
  }

  const tokens = JSON.parse(fs.readFileSync(tokensPath, "utf8"));

  const encontrado = tokens.find(t => t.codigo === token);

  if (!encontrado) {
    return res.json({ valido: false });
  }

  res.json({
    valido: true,
    morador: encontrado.morador,
    peso: encontrado.peso
  });

};

/* VOTAR */
exports.votar = (req, res) => {
  res.json({ ok: true });
};