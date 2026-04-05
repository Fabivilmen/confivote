const fs = require("fs");
const path = require("path");

const presencasPath = path.join(__dirname, "../../data/presencas.json");

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

function listarPresencas(req, res) {
  try {
    const assembleiaId = Number(req.params.assembleiaId);
    const presencas = lerJson(presencasPath);

    const filtradas = presencas.filter(
      p => Number(p.assembleiaId) === assembleiaId
    );

    return res.json(filtradas);
  } catch (erro) {
    console.error("Erro ao listar presenças:", erro);
    return res.status(500).json({ erro: "Erro ao listar presenças" });
  }
}

function salvarPresencas(req, res) {
  try {
    const dados = req.body;

    if (!Array.isArray(dados)) {
      return res.status(400).json({ erro: "O corpo deve ser um array" });
    }

    if (!dados.length) {
      salvarJson(presencasPath, []);
      return res.json({ ok: true });
    }

    const assembleiaId = Number(dados[0].assembleiaId);
    const existentes = lerJson(presencasPath);

    const outrasAssembleias = existentes.filter(
      p => Number(p.assembleiaId) !== assembleiaId
    );

    const normalizadas = dados.map(item => {

      let representadoPor = normalizar(item.representadoPor);
      let presente = item.presente === true;

      // REGRA PRINCIPAL
      if (representadoPor !== "") {
        presente = false;
      }

      return {
        assembleiaId: Number(item.assembleiaId),
        unidade: normalizar(item.unidade),
        nome: String(item.nome || "").trim(),
        quotite: Number(item.quotite) || 0,
        presente,
        representadoPor
      };
    });

    const final = [...outrasAssembleias, ...normalizadas];

    salvarJson(presencasPath, final);

    return res.json({ ok: true, total: normalizadas.length });

  } catch (erro) {
    console.error("Erro ao salvar presenças:", erro);
    return res.status(500).json({ erro: "Erro ao salvar presenças" });
  }
}

module.exports = {
  listarPresencas,
  salvarPresencas
};