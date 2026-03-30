const express = require("express");
const router = express.Router();

const {
    listarPautas,
    criarPauta,
    limparPautas,
    abrirPauta,
    encerrarPauta,
    pautaAtiva
} = require("../controllers/pautasController");

router.get("/ativa", pautaAtiva);
router.post("/limpar", limparPautas);
router.post("/abrir/:numero", abrirPauta);
router.post("/encerrar/:numero", encerrarPauta);

router.get("/:assembleiaId", listarPautas);
router.post("/", criarPauta);

module.exports = router;