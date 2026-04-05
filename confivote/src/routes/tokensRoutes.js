const express = require("express");
const router = express.Router();

const tokensController = require("../controllers/tokensController");

router.get("/", tokensController.listarTokens);

// aceita GET e POST para não depender de como o front chama
router.get("/gerar", tokensController.gerarTokens);
router.post("/gerar", tokensController.gerarTokens);

module.exports = router;