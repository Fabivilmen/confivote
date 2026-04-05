const express = require("express");
const router = express.Router();

const votosController = require("../controllers/votosController");

// REGISTRAR VOTO
router.post("/", votosController.registrarVoto);

// LISTAR
router.get("/", votosController.listarVotos);

// LISTAR POR PAUTA
router.get("/pauta/:pautaNumero", votosController.listarVotosPorPauta);

// CORREÇÃO AQUI (AGORA FUNCIONA NO NAVEGADOR)
router.get("/limpar", votosController.limparVotos);

module.exports = router;