const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "index.html"));
});

// rotas API
app.use("/api/pautas", require("./src/routes/pautasRoutes"));
app.use("/api/tokens", require("./src/routes/tokensRoutes"));
app.use("/api/moradores", require("./src/routes/moradoresRoutes"));
app.use("/api/presencas", require("./src/routes/presencasRoutes"));
app.use("/api/votar", require("./src/routes/votarRoutes"));
app.use("/api/votos", require("./src/routes/votosRoutes")); // ✅ ADICIONADO
app.use("/api/ata", require("./src/routes/ataRoutes"));

app.listen(5000, () => {
  console.log("SERVER OK 5000");
});