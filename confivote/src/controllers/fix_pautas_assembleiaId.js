const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/pautas.json");

function main() {
  if (!fs.existsSync(filePath)) {
    console.error("Arquivo não encontrado");
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8").trim();
  if (!raw) process.exit(0);

  const pautas = JSON.parse(raw);

  if (!Array.isArray(pautas)) process.exit(1);

  const corrigidas = pautas.map(p => ({
    ...p,
    assembleiaId: String(p.assembleiaId || "8")
  }));

  fs.writeFileSync(filePath, JSON.stringify(corrigidas, null, 2), "utf-8");

  console.log("pautas corrigidas");
}

main();