const express = require("express");
const router = express.Router();

const sessaoController = require("../controllers/sessaoController");

router.get("/reset", sessaoController.resetSessao);

module.exports = router;