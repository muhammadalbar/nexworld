var express = require("express");
var router = express.Router();
const { sendEmail } = require("./controller");

router.post("/", sendEmail);

module.exports = router;
