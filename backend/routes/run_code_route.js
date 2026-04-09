const express = require("express");
const router = express.Router();
const { runCppCode } = require("../services/cpp_service");
const { runcCode } = require("../services/c_service");
const { runpyCode } = require("../services/python_service");
const { runjavaCode } = require("../services/java_service");
const { runjsCode } = require("../services/javascript_service");
const { runtsCode } = require("../services/ts_service");
const { runchashCode } = require("../services/c#_service");

router.post("/cpp", runCppCode);

router.post("/python", runpyCode);

router.post("/java", runjavaCode);

router.post("/javascript", runjsCode);

router.post("/typescript", runtsCode);

router.post("/c", runcCode);

router.post("/csharp", runchashCode);

module.exports = router;