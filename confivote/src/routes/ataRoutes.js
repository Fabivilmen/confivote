const express = require("express");
const router = express.Router();

const ataController = require("../controllers/ataController");

// JSON da ATA
router.get("/json", ataController.getAtaJson);

// PDF da ATA
router.get("/pdf", ataController.getAtaPdf);

module.exports = router;
