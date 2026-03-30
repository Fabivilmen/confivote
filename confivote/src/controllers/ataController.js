const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const DATA_DIR = path.join(__dirname, "..", "..", "data");

function readJson(file) {
  const full = path.join(DATA_DIR, file);
  if (!fs.existsSync(full)) return [];
  let raw = fs.readFileSync(full, "utf-8");
  raw = raw.replace(/^\uFEFF/, "").trim();
  if (!raw) return [];
  return JSON.parse(raw);
}

function calcularResultado(sim, nao) {
  if (sim > nao) return "APROVADO";
  if (nao > sim) return "REPROVADO";
  return "EMPATE";
}

function montarDadosAta(assembleiaId) {
  const assembleias = readJson("assembleias.json");
  const pautas = readJson("pautas.json");
  const votos = readJson("votos.json");
  const tokens = readJson("tokens.json");

  const assembleia = assembleias.find(a => String(a.id) === String(assembleiaId));
  if (!assembleia) return null;

  const votosAG = votos.filter(v => String(v.assembleiaId) === String(assembleiaId));
  const pautasAG = pautas.filter(p => String(p.assembleiaId) === String(assembleiaId));
  const tokensAG = tokens.filter(t => String(t.assembleiaId) === String(assembleiaId));

  const totalPeso = tokensAG.reduce((s, t) => s + Number(t.peso || 0), 0);

  const resultados = pautasAG.map(p => {
    const vp = votosAG.filter(v =>
      String(v.pautaId) === String(p.id) ||
      String(v.pautaNumero) === String(p.numero)
    );

    let sim = 0, nao = 0, abst = 0;

    vp.forEach(v => {
      const token = tokensAG.find(t =>
        t.token === v.token || t.codigo === v.token
      );

      const peso = token ? Number(token.peso) : 0;
      const vv = String(v.voto).toUpperCase();

      if (vv === "SIM") sim += peso;
      else if (vv === "NAO" || vv === "NÃO") nao += peso;
      else abst += peso;
    });

    const percentual = totalPeso ? ((sim / totalPeso) * 100).toFixed(2) : 0;

    return {
      ...p,
      votos: { sim, nao, abst },
      percentual,
      resultado: calcularResultado(sim, nao)
    };
  });

  return { assembleia, resultados, totalPeso };
}

exports.getAtaPdf = (req, res) => {
  const { assembleiaId } = req.query;

  // 🔥 PEGA HORAS DO FRONT
  const inicio = req.query.inicio || "-";
  const fim = req.query.fim || "-";

  const dados = montarDadosAta(assembleiaId);
  if (!dados) return res.status(404).send("Assembleia não encontrada");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=ata.pdf");

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  // TÍTULO
  doc
    .fontSize(18)
    .fillColor("#0d6efd")
    .text("ATA DA ASSEMBLEIA GERAL", { align: "center" });

  doc.moveDown();

  // DADOS
  doc.fontSize(11).fillColor("black");

  doc.text(`Prédio: ${dados.assembleia.predio || "-"}`);
  doc.text(`Data: ${dados.assembleia.data || "-"}`);
  doc.text(`Local: ${dados.assembleia.local || "-"}`);
  doc.text(`Início da sessão: ${inicio}`);
  doc.text(`Encerramento da sessão: ${fim}`);

  doc.moveDown();

  // TEXTO INICIAL
  doc.text(
    "Aos presentes, foi realizada a Assembleia Geral de Coproprietários, devidamente convocada nos termos legais. " +
    "Após verificação do quórum necessário, os trabalhos foram iniciados e as pautas colocadas em votação conforme ordem do dia.",
    { align: "justify" }
  );

  doc.moveDown();

  // PAUTAS
  dados.resultados.forEach((r, i) => {
    doc
      .fontSize(13)
      .fillColor("#0d6efd")
      .text(`Pauta ${i + 1} - ${r.titulo}`, { underline: true });

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor("black")
      .text(`SIM: ${r.votos.sim}`)
      .text(`NÃO: ${r.votos.nao}`)
      .text(`ABSTENÇÃO: ${r.votos.abst}`)
      .text(`Percentual de aprovação: ${r.percentual}%`)
      .text(`Resultado: ${r.resultado}`);

    doc.moveDown();
  });

  // ENCERRAMENTO
  doc.moveDown();
  doc.text(
    "Nada mais havendo a tratar, a sessão foi encerrada, sendo a presente ata lavrada e assinada.",
    { align: "justify" }
  );

  doc.moveDown(2);

  // ASSINATURAS
  doc.text("Presidente: ______________________________");
  doc.text("Secretário: ______________________________");
  doc.text("Syndic: ______________________________");

  doc.end();
};

exports.getAtaJson = (req, res) => {
  const { assembleiaId } = req.query;

  const dados = montarDadosAta(assembleiaId);
  if (!dados) return res.status(404).json({ ok: false });

  res.json({ ok: true, ...dados });
};