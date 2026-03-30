const express = require("express");
const router = express.Router();
const controller = require("../controllers/presencasController");

router.get("/:assembleiaId", controller.listarPresencas);
router.post("/", controller.salvarPresencas);

module.exports = router;