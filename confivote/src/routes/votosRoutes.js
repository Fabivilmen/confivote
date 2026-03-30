const express = require("express");
const router = express.Router();

const {
  registrarVoto,
  listarVotosPorPauta
} = require("../controllers/votosController");

router.post("/", registrarVoto);
router.get("/pauta/:pautaId", listarVotosPorPauta);

module.exports = router;