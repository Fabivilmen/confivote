// src/controllers/assembleiasController.js
const fs = require("fs/promises");
const path = require("path");

async function ensureFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "[]", "utf-8");
  }
}

function getFilePath() {
  return path.join(process.cwd(), "data", "assembleias.json");
}

async function readAll() {
  const filePath = getFilePath();
  await ensureFile(filePath);
  const raw = await fs.readFile(filePath, "utf-8");
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeAll(list) {
  const filePath = getFilePath();
  await ensureFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(list, null, 2), "utf-8");
}

function normStr(v) {
  return String(v ?? "").trim();
}

function normalizeBody(body = {}) {
  return {
    condominio: normStr(body.condominio),
    titulo: normStr(body.titulo),
    data: normStr(body.data),
    hora: normStr(body.hora),
    local: normStr(body.local),
    convidados: normStr(body.convidados),
    textoConvocacao: normStr(body.textoConvocacao),
    ordemDia: Array.isArray(body.ordemDia) ? body.ordemDia : [],
    pautas: Array.isArray(body.ordemDia) ? body.ordemDia : []
  };
}

function requiredMissing(obj) {
  const missing = [];
  if (!obj.condominio) missing.push("condominio");
  if (!obj.titulo) missing.push("titulo");
  if (!obj.data) missing.push("data");
  if (!obj.hora) missing.push("hora");
  if (!obj.local) missing.push("local");
  if (!obj.ordemDia) missing.push("ordemDia");
  return missing;
}

module.exports = {

  async listar(req, res) {
    try {
      const list = await readAll();
      res.json({ ok: true, total: list.length, assembleias: list });
    } catch (err) {
      res.status(500).json({ ok: false, erro: String(err) });
    }
  },

  async obter(req, res) {
    try {
      const id = Number(req.params.id);
      const list = await readAll();
      const item = list.find((a) => Number(a.id) === id);
      if (!item)
        return res.status(404).json({ ok: false, erro: "Assembleia não encontrada" });

      res.json({ ok: true, assembleia: item });
    } catch (err) {
      res.status(500).json({ ok: false, erro: String(err) });
    }
  },

  async criar(req, res) {
    try {
      const dataNorm = normalizeBody(req.body);
      const missing = requiredMissing(dataNorm);

      if (missing.length) {
        return res.status(400).json({
          ok: false,
          erro: "Dados incompletos",
          faltando: missing
        });
      }

      const list = await readAll();
      const nextId =
        list.reduce((max, a) => Math.max(max, Number(a.id) || 0), 0) + 1;

      const nova = {
        id: nextId,
        ...dataNorm,
        createdAt: new Date().toISOString()
      };

      list.push(nova);
      await writeAll(list);

      // salvar pautas no pautas.json
     const pautasPath = path.join(process.cwd(), "src", "data", "pautas.json");
      await ensureFile(pautasPath);

      const rawP = await fs.readFile(pautasPath, "utf-8");
      let pautas = [];
      try { pautas = JSON.parse(rawP); } catch {}

      const novasPautas = (nova.pautas || []).map((p, i) => ({
        id: Date.now() + i,
        assembleiaId: nova.id,
        titulo: p.titulo || `Pauta ${i + 1}`,
        descricao: "",
        maioria: "simples"
      }));

      pautas.push(...novasPautas);
      await fs.writeFile(pautasPath, JSON.stringify(pautas, null, 2), "utf-8");

      console.log("✅ PAUTAS SALVAS PARA ASSEMBLEIA:", nova.id);

      res.status(201).json({ ok: true, assembleia: nova });

    } catch (err) {
      res.status(500).json({ ok: false, erro: String(err) });
    }
  },

  async atualizar(req, res) {
    try {
      const id = Number(req.params.id);
      const list = await readAll();
      const idx = list.findIndex((a) => Number(a.id) === id);

      if (idx < 0)
        return res.status(404).json({ ok: false, erro: "Assembleia não encontrada" });

      const patch = normalizeBody(req.body);
      const atual = list[idx];

      const updated = {
        ...atual,
        ...patch,
        updatedAt: new Date().toISOString()
      };

      list[idx] = updated;
      await writeAll(list);

      res.json({ ok: true, assembleia: updated });

    } catch (err) {
      res.status(500).json({ ok: false, erro: String(err) });
    }
  }
};