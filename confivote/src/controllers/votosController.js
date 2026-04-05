const fs = require("fs");
const path = require("path");

const votosPath = path.join(__dirname, "../../data/votos.json");
const tokensPath = path.join(__dirname, "../../data/tokens.json");

// =========================
// FUNÇÃO AUXILIAR
// =========================
function lerJson(filePath) {
  if (!fs.existsSync(filePath)) return [];
  let raw = fs.readFileSync(filePath, "utf-8");
  raw = raw.replace(/^\uFEFF/, "").trim();
  if (!raw) return [];
  return JSON.parse(raw);
}

function salvarJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// =========================
// REGISTRAR VOTO
// =========================
exports.registrarVoto = (req, res) => {
  try {
    const { assembleiaId, pautaNumero, token, voto } = req.body;

    if (!assembleiaId || !pautaNumero || !token || !voto) {
      return res.status(400).json({ ok: false, erro: "Dados inválidos" });
    }

    const votos = lerJson(votosPath);
    const tokens = lerJson(tokensPath);

    // impedir duplicidade (mesmo token na mesma pauta)
    const jaVotou = votos.find(v =>
      String(v.assembleiaId) === String(assembleiaId) &&
      String(v.pautaNumero) === String(pautaNumero) &&
      v.token === token
    );

    if (jaVotou) {
      return res.status(400).json({ ok: false, erro: "Token já votou nesta pauta" });
    }

    // validar token
    const tokenObj = tokens.find(t =>
      t.token === token || t.codigo === token
    );

    if (!tokenObj) {
      return res.status(400).json({ ok: false, erro: "Token inválido" });
    }

    votos.push({
      id: Date.now(),
      assembleiaId: Number(assembleiaId),
      pautaNumero: Number(pautaNumero),
      token,
      voto: String(voto).toUpperCase(),
      peso: Number(tokenObj.peso) || 1,
      createdAt: new Date().toISOString()
    });

    salvarJson(votosPath, votos);

    res.json({ ok: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false });
  }
};

// =========================
// LISTAR VOTOS DA ASSEMBLEIA
// =========================
exports.listarVotos = (req, res) => {
  try {
    const { assembleiaId } = req.query;

    const votos = lerJson(votosPath);

    const filtrados = votos.filter(v =>
      String(v.assembleiaId) === String(assembleiaId)
    );

    res.json(filtrados);

  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
};

// =========================
// LISTAR VOTOS POR PAUTA
// =========================
exports.listarVotosPorPauta = (req, res) => {
  try {
    const { pautaNumero } = req.params;

    const votos = lerJson(votosPath);

    const filtrados = votos.filter(v =>
      String(v.pautaNumero) === String(pautaNumero)
    );

    res.json({ ok: true, dados: filtrados });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false });
  }
};

// =========================
// VALIDAR TOKEN
// =========================
exports.validarToken = (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.json({ valido: false });
    }

    const tokens = lerJson(tokensPath);

    const encontrado = tokens.find(t =>
      t.codigo === token || t.token === token
    );

    if (!encontrado) {
      return res.json({ valido: false });
    }

    res.json({
      valido: true,
      morador: encontrado.morador,
      peso: encontrado.peso
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ valido: false });
  }
};

// =========================
// LIMPAR VOTOS (ESSENCIAL)
// =========================
exports.limparVotos = (req, res) => {
  try {
    const { assembleiaId } = req.query;

    let votos = lerJson(votosPath);

    votos = votos.filter(v =>
      String(v.assembleiaId) !== String(assembleiaId)
    );

    salvarJson(votosPath, votos);

    res.json({ ok: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false });
  }
};