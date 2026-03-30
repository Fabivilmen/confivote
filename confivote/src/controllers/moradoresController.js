const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/moradores.json");

/* LISTAR MORADORES POR ASSEMBLEIA */
const listarMoradores = (req, res) => {
  try {
    const { assembleiaId } = req.params;

    let conteudo = fs.readFileSync(filePath, "utf8");
    conteudo = conteudo.replace(/^\uFEFF/, "");

    const moradores = JSON.parse(conteudo);

    const filtrados = moradores.filter(
      m => m.assembleiaId == assembleiaId
    );

    res.json(filtrados);

  } catch (err) {
    console.error("Erro ao listar moradores:", err);
    res.status(500).json({ erro: "Erro ao listar moradores" });
  }
};

/* SALVAR MORADORES */
const salvarMoradores = (req, res) => {
  try {
    const novos = req.body;

    if (!Array.isArray(novos)) {
      return res.status(400).json({ erro: "Formato inválido" });
    }

    let existentes = [];

    if (fs.existsSync(filePath)) {
      let conteudo = fs.readFileSync(filePath, "utf8");
      conteudo = conteudo.replace(/^\uFEFF/, "");
      existentes = JSON.parse(conteudo);
    }

    // Remove antigos da mesma assembleia
    const assembleiaId = novos[0]?.assembleiaId;
    const filtrados = existentes.filter(
      m => m.assembleiaId != assembleiaId
    );

    const atualizados = [...filtrados, ...novos];

    fs.writeFileSync(filePath, JSON.stringify(atualizados, null, 2));

    res.json({ ok: true });

  } catch (err) {
    console.error("Erro ao salvar moradores:", err);
    res.status(500).json({ erro: "Erro ao salvar moradores" });
  }
};

module.exports = {
  listarMoradores,
  salvarMoradores
};