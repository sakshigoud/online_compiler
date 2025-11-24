const express = require("express");
const router = express.Router();
const { runCppCode } = require("../services/cpp_service");
const { runpyCode } = require("../services/python_service");
const { runjavaCode } = require("../services/java_service");
const { runjsCode } = require("../services/javascript_service");

router.post("/cpp", runCppCode);

router.post("/python", runpyCode);

router.post("/java", runjavaCode);

router.post("/javascript", runjsCode);


module.exports = router;