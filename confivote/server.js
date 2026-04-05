const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

// =========================
// ARQUIVOS ESTÁTICOS
// =========================
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// =========================
// PÁGINA INICIAL
// =========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "index.html"));
});

// =========================
// ROTAS API
// =========================
app.use("/api/pautas", require("./src/routes/pautasRoutes"));
app.use("/api/tokens", require("./src/routes/tokensRoutes"));
app.use("/api/moradores", require("./src/routes/moradoresRoutes"));
app.use("/api/presencas", require("./src/routes/presencasRoutes"));
app.use("/api/sessao", require("./src/routes/sessaoRoutes"));
app.use("/api/votos", require("./src/routes/votosRoutes"));
app.use("/api/votar", require("./src/routes/votarRoutes"));
app.use("/api/ata", require("./src/routes/ataRoutes"));

// =========================
// START SERVER
// =========================
app.listen(5000, "0.0.0.0", () => {
  console.log("SERVER OK 5000");
});