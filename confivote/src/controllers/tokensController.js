const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const presencasPath = path.join(__dirname, "../data/presencas.json");
const tokensPath = path.join(__dirname, "../data/tokens.json");

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

    if (!assembleiaId) {
      return res.status(400).json({ erro: "assembleiaId obrigatório" });
    }

    const presencas = lerJson(presencasPath);

    const lista = presencas.filter(
      p => Number(p.assembleiaId) === assembleiaId
    );

    const tokens = [];
    const baseUrl = getBaseUrl(req);

    for (const p of lista) {
      const unidade = normalizar(p.unidade);
      const representadoPor = normalizar(p.representadoPor);

      if (p.presente !== true) continue;
      if (representadoPor !== "") continue;

      let peso = Number(p.quotite) || 0;

      for (const outro of lista) {
        const rep = normalizar(outro.representadoPor);

        if (
          outro.presente === false &&
          rep === unidade
        ) {
          peso += Number(outro.quotite) || 0;
        }
      }

      const codigo = gerarCodigo();
      const url = `${baseUrl}/app/votar.html?token=${codigo}&assembleiaId=${assembleiaId}`;
      const qrCode = await QRCode.toDataURL(url);

      tokens.push({
        assembleiaId,
        unidade,
        morador: p.nome,
        nome: p.nome,
        peso,
        codigo,
        token: codigo,
        url,
        qrCode
      });
    }

    salvarJson(tokensPath, tokens);

    return res.json(tokens);
  } catch (erro) {
    console.error("Erro ao gerar tokens:", erro);
    return res.status(500).json({ erro: "Erro ao gerar tokens" });
  }
}

function listarTokens(req, res) {
  try {
    const assembleiaId = Number(req.query.assembleiaId);
    const tokens = lerJson(tokensPath);

    if (!assembleiaId) {
      return res.json(tokens);
    }

    const filtrados = tokens.filter(
      t => Number(t.assembleiaId) === assembleiaId
    );

    return res.json(filtrados);
  } catch (erro) {
    console.error("Erro ao listar tokens:", erro);
    return res.status(500).json({ erro: "Erro ao listar tokens" });
  }
}

module.exports = {
  gerarTokens,
  listarTokens
};