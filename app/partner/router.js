var express = require("express");
var router = express.Router();
const { isAllow } = require("../../middleware/authApi");
const {
  getPartners,
  getPartner,
  addPartner,
  updatePartner,
  deletePartner,
  search,
} = require("./controller");

router.get("/getPartners", getPartners);
router.get("/getPartner/:id", getPartner);
router.get("/", search);

router.use(isAllow);
router.post("/addPartner", addPartner);
router.put("/updatePartner/:id", updatePartner);
router.delete("/deletePartner/:id", deletePartner);

module.exports = router;
