const express = require("express");
const router = express.Router();

const { validarToken } = require("../controllers/votarController");

router.get("/validar", validarToken);

module.exports = router;