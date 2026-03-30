const express = require("express");
const router = express.Router();
const moradoresController = require("../controllers/moradoresController");

/* GET moradores por assembleia */
router.get("/:assembleiaId", moradoresController.listarMoradores);

/* POST salvar moradores */
router.post("/", moradoresController.salvarMoradores);

module.exports = router;