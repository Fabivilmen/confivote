const fs = require("fs");
const path = require("path");

const pautasPath = path.join(__dirname, "../../data/pautas.json");

function lerPautas() {
    if (!fs.existsSync(pautasPath)) return [];

    try {
        const data = fs.readFileSync(pautasPath, "utf8");
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Erro ao ler pautas:", e);
        return [];
    }
}

function salvarPautas(pautas) {
    fs.writeFileSync(pautasPath, JSON.stringify(pautas, null, 2));
}

function normalizar(p, index) {
    return {
        id: p.id || Date.now() + index,
        numero: Number(p.numero || (index + 1)),
        assembleiaId: Number(p.assembleiaId),
        titulo: p.titulo || `Pauta ${index + 1}`,
        descricao: p.descricao || "",
        maioria: p.maioria || "simples",
        status: p.status || "fechada"
    };
}

function listarPautas(req, res) {
    const assembleiaId = Number(req.params.assembleiaId);

    const pautas = lerPautas()
        .filter(p => Number(p.assembleiaId) === assembleiaId)
        .map((p, i) => normalizar(p, i));

    res.json(pautas);
}

function criarPauta(req, res) {
    const { assembleiaId, titulo, descricao, maioria } = req.body;

    let pautas = lerPautas();

    const numero =
        pautas.filter(p => Number(p.assembleiaId) === Number(assembleiaId)).length + 1;

    const nova = {
        id: Date.now(),
        numero,
        assembleiaId: Number(assembleiaId),
        titulo: titulo || `Pauta ${numero}`,
        descricao: descricao || "",
        maioria: maioria || "simples",
        status: "fechada"
    };

    pautas.push(nova);
    salvarPautas(pautas);

    res.json(nova);
}

function limparPautas(req, res) {
    const assembleiaId = Number(req.query.assembleiaId);

    let pautas = lerPautas();
    pautas = pautas.filter(p => Number(p.assembleiaId) !== assembleiaId);

    salvarPautas(pautas);

    res.json({ ok: true });
}

function abrirPauta(req, res) {
    const numero = Number(req.params.numero);
    const assembleiaId = Number(req.query.assembleiaId);

    let pautas = lerPautas();

    // fecha todas primeiro
    pautas.forEach(p => {
        if (Number(p.assembleiaId) === assembleiaId) {
            p.status = "fechada";
        }
    });

    // abre a escolhida
    const pauta = pautas.find(
        p => Number(p.numero) === numero && Number(p.assembleiaId) === assembleiaId
    );

    if (!pauta) return res.status(404).json({ erro: "pauta não encontrada" });

    pauta.status = "aberta";

    salvarPautas(pautas);

    res.json({ ok: true, numero: pauta.numero });
}

function encerrarPauta(req, res) {
    const numero = Number(req.params.numero);
    const assembleiaId = Number(req.query.assembleiaId);

    let pautas = lerPautas();

    const pauta = pautas.find(
        p => Number(p.numero) === numero && Number(p.assembleiaId) === assembleiaId
    );

    if (!pauta) return res.status(404).json({ erro: "pauta não encontrada" });

    pauta.status = "fechada";

    salvarPautas(pautas);

    res.json({ ok: true });
}

function pautaAtiva(req, res) {
    const assembleiaId = Number(req.query.assembleiaId);

    const pautas = lerPautas();

    const ativa = pautas.find(
        p => Number(p.assembleiaId) === assembleiaId && p.status === "aberta"
    );

    if (!ativa) {
        return res.json({
            ativa: false,
            numero: null
        });
    }

    return res.json({
        ativa: true,
        numero: ativa.numero,
        titulo: ativa.titulo,
        descricao: ativa.descricao || ativa.titulo
    });
}

module.exports = {
    listarPautas,
    criarPauta,
    limparPautas,
    abrirPauta,
    encerrarPauta,
    pautaAtiva
};