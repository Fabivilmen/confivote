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
  const total = sim + nao;
  if (total === 0) return "SEM VOTOS";

  const percSim = (sim / total) * 100;

  if (percSim >= 50) return `APROVADO (${percSim.toFixed(1)}%)`;
  return `REPROVADO (${percSim.toFixed(1)}%)`;
}

function montarDadosAta(assembleiaId) {
  const assembleias = readJson("assembleias.json");
  const pautas = readJson("pautas.json");
  const votos = readJson("votos.json");

  const assembleia = assembleias.find(
    a => String(a.id) === String(assembleiaId)
  );

  if (!assembleia) return null;

  const votosAG = votos.filter(
    v => String(v.assembleiaId) === String(assembleiaId)
  );

  const pautasAG = pautas.filter(
    p => String(p.assembleiaId) === String(assembleiaId)
  );

  const resultados = pautasAG.map(p => {
    const vp = votosAG.filter(
      v => String(v.pautaNumero) === String(p.numero)
    );

    let sim = 0, nao = 0, abst = 0;
    const tokensContados = new Set();

    vp.forEach(v => {
      if (tokensContados.has(v.token)) return;
      tokensContados.add(v.token);

      const peso = Number(v.peso) || 1;
      const voto = String(v.voto).toUpperCase();

      if (voto === "SIM") sim += peso;
      else if (voto === "NAO" || voto === "NÃO") nao += peso;
      else abst += peso;
    });

    const total = sim + nao + abst;
    const percentual = total ? ((sim / total) * 100).toFixed(2) : 0;

    return {
      ...p,
      votos: { sim, nao, abst },
      percentual,
      resultado: calcularResultado(sim, nao)
    };
  });

  return { assembleia, resultados };
}

exports.getAtaPdf = (req, res) => {
  const { assembleiaId } = req.query;

  const inicio = req.query.inicio || "-";
  const fim = req.query.fim || "-";

  const observacoes = req.query.observacoes || "";
  const proximaAG = req.query.proximaAG || "";
  const presidente = req.query.presidente || "";
  const secretario = req.query.secretario || "";
  const sindico = req.query.sindico || "";

  const dados = montarDadosAta(assembleiaId);
  if (!dados) return res.status(404).send("Assembleia não encontrada");

  const a = dados.assembleia;

  // CORREÇÃO DEFINITIVA
  const nomePredio =
    a.condominio ||
    a.predio ||
    a.nome ||
    a.copropriedade ||
    "-";

  const local =
    a.local ||
    a.endereco ||
    a.morada ||
    "-";

  res.setHeader("Content-Type", "application/pdf");

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  const logoPath = path.join(__dirname, "../../public/img/logo-confivote.png");

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, { fit: [120, 120], align: "center" });
    doc.moveDown();
  }

  doc
    .fontSize(18)
    .fillColor("#0d6efd")
    .text("ATA DA ASSEMBLEIA GERAL DE COPROPRIEDADE", { align: "center" });

  doc.moveDown();

  doc.fontSize(11).fillColor("black");

  doc.text(`Copropriedade: ${nomePredio}`);
  doc.text(`Data: ${a.data || "-"}`);
  doc.text(`Local: ${local}`);
  doc.text(`Início da sessão: ${inicio}`);
  doc.text(`Encerramento da sessão: ${fim}`);

  doc.moveDown();

  doc.text(
    "A Assembleia Geral de Coproprietários foi realizada conforme convocação regular. Após verificação do quórum, as pautas foram submetidas à votação.",
    { align: "justify" }
  );

  doc.moveDown();

  dados.resultados.forEach((r) => {
    doc
      .fontSize(13)
      .fillColor("#0d6efd")
      .text(`Pauta ${r.numero} - ${r.titulo}`, { underline: true });

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor("black")
      .text(`SIM: ${r.votos.sim}`)
      .text(`NÃO: ${r.votos.nao}`)
      .text(`ABSTENÇÃO: ${r.votos.abst}`)
      .text(`Percentual: ${r.percentual}%`)
      .text(`Resultado: ${r.resultado}`);

    doc.moveDown();
  });

  doc.moveDown();
  doc.text("Observações:");
  doc.text(observacoes || "Nenhuma.");

  doc.moveDown();

  doc.text("Pontos para próxima AG:");
  doc.text(proximaAG || "Nenhum.");

  doc.moveDown(2);

  doc.text(`Presidente: ${presidente || "________________________"}`);
  doc.text(`Secretário: ${secretario || "________________________"}`);
  doc.text(`Síndico: ${sindico || "________________________"}`);

  doc.end();
};

exports.getAtaJson = (req, res) => {
  const { assembleiaId } = req.query;

  const dados = montarDadosAta(assembleiaId);
  if (!dados) return res.status(404).json({ ok: false });

  res.json({ ok: true, ...dados });
};