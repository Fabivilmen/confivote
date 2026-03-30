const express = require("express");
const router = express.Router();

const votarController = require("../controllers/votarController");

router.get("/validar", votarController.validarToken);
router.post("/", votarController.votar);

module.exports = router;