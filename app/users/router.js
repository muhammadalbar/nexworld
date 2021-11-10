var express = require("express");
var router = express.Router();
const { actionSignin } = require("./controller");

router.post("/signin", actionSignin);

module.exports = router;
