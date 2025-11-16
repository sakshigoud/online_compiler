const express = require("express");
const router = express.Router();
const { runCppCode } = require("../services/cpp_service");

router.post("/cpp", runCppCode);

module.exports = router;