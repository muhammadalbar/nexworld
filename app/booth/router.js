var express = require("express");
var router = express.Router();
const { isAllow } = require("../../middleware/authApi");
const {
  getBooths,
  getBooth,
  addBooth,
  updateBooth,
  deleteBooth,
  search,
} = require("./controller");

router.get("/", search);
router.get("/getBooths", getBooths);
router.get("/getBooth/:id", getBooth);

router.use(isAllow);
router.post("/addBooth", addBooth);
router.put("/updateBooth/:id", updateBooth);
router.delete("/deleteBooth/:id", deleteBooth);

module.exports = router;
