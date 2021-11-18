var express = require("express");
var router = express.Router();
const { isAllow } = require("../../middleware/authApi");
const {
  getGuests,
  getGuest,
  addGuest,
  updateGuest,
  deleteGuest,
  search,
} = require("./controller");

router.get("/getGuests", getGuests);
router.get("/", search);
router.get("/getGuest/:id", getGuest);

router.use(isAllow);
router.post("/addGuest", addGuest);
router.put("/updateGuest/:id", updateGuest);
router.delete("/deleteGuest/:id", deleteGuest);

module.exports = router;
