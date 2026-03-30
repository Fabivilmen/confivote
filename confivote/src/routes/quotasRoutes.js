const express = require("express");
const router = express.Router();
const quotasController = require("../controllers/quotasController");

// GET — listar quotas
router.get("/", quotasController.listarQuotas);

module.exports = router;
