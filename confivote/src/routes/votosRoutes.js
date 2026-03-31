const express = require("express");
const router = express.Router();

const {
  registrarVoto,
  listarVotosPorPauta,
  listarVotos
} = require("../controllers/votosController");

router.post("/", registrarVoto);

// NOVA ROTA (ESSA É A IMPORTANTE)
router.get("/", listarVotos);

router.get("/pauta/:pautaId", listarVotosPorPauta);

module.exports = router;