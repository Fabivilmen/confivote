const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("SERVIDOR OK");
});

app.get("/teste.html", (req, res) => {
  res.send("<h1>TESTE OK</h1>");
});

app.listen(5000, () => {
  console.log("TESTE RODANDO");
});