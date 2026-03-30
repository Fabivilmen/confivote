// src/routes/assembleiasRoutes.js
const express = require("express");
const router = express.Router();

const assembleiasController = require("../controllers/assembleiasController");

router.get("/", assembleiasController.listar);
router.get("/:id", assembleiasController.obter);
router.post("/", assembleiasController.criar);
router.put("/:id", assembleiasController.atualizar);

module.exports = router;
