const express = require("express");
const router = express.Router();
const controller = require("../controllers/tokensController");

router.get("/", controller.listarTokens);
router.post("/gerar", controller.gerarTokens);

module.exports = router;