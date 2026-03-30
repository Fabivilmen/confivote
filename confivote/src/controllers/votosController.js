const fs = require("fs");
const path = require("path");

const votosPath = path.join(__dirname, "../../data/votos.json");
const tokensPath = path.join(__dirname, "../../data/tokens.json");

// =========================
// REGISTRAR VOTO
// =========================
exports.registrarVoto = (req, res) => {
  try {
    const { assembleiaId, pautaId, token, voto } = req.body;

    if (!assembleiaId || !pautaId || !token || !voto) {
      return res.status(400).json({ ok: false });
    }

    let votos = [];
    if (fs.existsSync(votosPath)) {
      const conteudo = fs.readFileSync(votosPath, "utf-8");
      votos = conteudo ? JSON.parse(conteudo) : [];
    }

    // impedir voto duplicado
    const jaVotou = votos.find(
      v =>
        String(v.assembleiaId) === String(assembleiaId) &&
        String(v.pautaId) === String(pautaId) &&
        v.token === token
    );

    if (jaVotou) {
      return res.status(400).json({ ok: false, erro: "Token já votou nesta pauta" });
    }

    // pegar peso do token
    let tokens = [];
    if (fs.existsSync(tokensPath)) {
      const conteudoTokens = fs.readFileSync(tokensPath, "utf-8");
      tokens = conteudoTokens ? JSON.parse(conteudoTokens) : [];
    }

    const tokenObj = tokens.find(t => t.token === token);

    if (!tokenObj) {
      return res.status(400).json({ ok: false, erro: "Token inválido" });
    }

    votos.push({
      id: Date.now(),
      assembleiaId,
      pautaId,
      token,
      voto: voto.toUpperCase(),
      peso: tokenObj.peso,
      createdAt: new Date().toISOString()
    });

    fs.writeFileSync(votosPath, JSON.stringify(votos, null, 2));

    res.json({ ok: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false });
  }
};

// =========================
// LISTAR VOTOS POR PAUTA
// =========================
exports.listarVotosPorPauta = (req, res) => {
  try {
    const { pautaId } = req.params;

    if (!fs.existsSync(votosPath)) {
      return res.json({ ok: true, dados: [] });
    }

    const conteudo = fs.readFileSync(votosPath, "utf-8");
    const votos = conteudo ? JSON.parse(conteudo) : [];

    const filtrados = votos.filter(v => String(v.pautaId) === String(pautaId));

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

    if (!fs.existsSync(tokensPath)) {
      return res.json({ valido: false });
    }

    const conteudo = fs.readFileSync(tokensPath, "utf-8");
    const tokens = conteudo ? JSON.parse(conteudo) : [];

    const encontrado = tokens.find(t => t.codigo === token);

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