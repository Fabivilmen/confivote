const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const presencasPath = path.join(__dirname, "../../data/presencas.json");
const tokensPath = path.join(__dirname, "../../data/tokens.json");

const BASE_URL_FIXA = "https://uriah-dialytic-trinh.ngrok-free.dev";

function lerJson(caminho) {
  if (!fs.existsSync(caminho)) return [];
  let conteudo = fs.readFileSync(caminho, "utf8");
  conteudo = conteudo.replace(/^\uFEFF/, "").trim();
  if (!conteudo) return [];
  return JSON.parse(conteudo);
}

function salvarJson(caminho, dados) {
  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), "utf8");
}

function normalizar(valor) {
  return String(valor || "").trim().toUpperCase();
}

function gerarCodigo() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getBaseUrl(req) {
  if (BASE_URL_FIXA) return BASE_URL_FIXA;
  return `${req.protocol}://${req.get("host")}`;
}

async function gerarTokens(req, res) {
  try {
    const assembleiaId = Number(req.body.assembleiaId || req.query.assembleiaId);

    const presencas = lerJson(presencasPath);
    const lista = presencas.filter(p => Number(p.assembleiaId) === assembleiaId);

    const tokens = [];
    const baseUrl = getBaseUrl(req);

    for (const p of lista) {
      if (p.presente !== true) continue;

      const unidade = normalizar(p.unidade);

      let peso = Number(p.quotite) || 0;

      for (const outro of lista) {
        if (
          outro.presente === false &&
          normalizar(outro.representadoPor) === unidade
        ) {
          peso += Number(outro.quotite) || 0;
        }
      }

      const codigo = gerarCodigo();

      // CORREÇÃO PRINCIPAL AQUI
      const url = `${baseUrl}/app/votar.html?token=${codigo}&assembleiaId=${assembleiaId}`;

      const qrCode = await QRCode.toDataURL(url);

      tokens.push({
        assembleiaId,
        unidade,
        morador: p.nome,
        peso,
        codigo,
        token: codigo,
        url,
        qrCode
      });
    }

    salvarJson(tokensPath, tokens);

    res.json(tokens);

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao gerar tokens" });
  }
}

function listarTokens(req, res) {
  const assembleiaId = Number(req.query.assembleiaId);
  const tokens = lerJson(tokensPath);

  const filtrados = tokens.filter(
    t => Number(t.assembleiaId) === assembleiaId
  );

  res.json(filtrados);
}

module.exports = {
  gerarTokens,
  listarTokens
};