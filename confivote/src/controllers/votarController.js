const fs = require("fs");
const path = require("path");

const tokensPath = path.join(__dirname, "../../data/tokens.json");

function lerJson(caminho) {
  if (!fs.existsSync(caminho)) return [];
  let conteudo = fs.readFileSync(caminho, "utf8");
  conteudo = conteudo.replace(/^\uFEFF/, "").trim();
  if (!conteudo) return [];
  return JSON.parse(conteudo);
}

function validarToken(req, res) {
  try {
    const token = String(req.query.token || "").trim();

    if (!token) {
      return res.status(400).json({ ok: false, erro: "Token não informado" });
    }

    const tokens = lerJson(tokensPath);

    const encontrado = tokens.find(t => t.token === token);

    if (!encontrado) {
      return res.status(404).json({ ok: false, erro: "Token inválido" });
    }

    return res.json({
      ok: true,
      token: encontrado.token,
      unidade: encontrado.unidade,
      peso: encontrado.peso
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
}

module.exports = {
  validarToken
};