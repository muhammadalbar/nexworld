var express = require("express");
var router = express.Router();
const { isAllow } = require("../../middleware/authApi");
const {
  getPartners,
  getPartner,
  addPartner,
  updatePartner,
  deletePartner,
  listRegion,
  getPartnerByRegion,
} = require("./controller");

router.get("/getPartners", getPartners);
router.get("/getPartner/:id", getPartner);
router.get("/getRegion", listRegion);
router.get("/getPartnerRegion", getPartnerByRegion);

router.use(isAllow);
router.post("/addPartner", addPartner);
router.put("/updatePartner/:id", updatePartner);
router.delete("/deletePartner/:id", deletePartner);

module.exports = router;
