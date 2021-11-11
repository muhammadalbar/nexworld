var express = require("express");
var router = express.Router();
const { isAllow } = require("../../middleware/authApi");
const {
  getRobots,
  getRobot,
  addRobot,
  updateRobot,
  deleteRobot,
  search,
} = require("./controller");

router.get("/getRobots", getRobots);
router.get("/", search);
router.get("/getRobot/:id", getRobot);

router.use(isAllow);
router.post("/addRobot", addRobot);
router.put("/updateRobot/:id", updateRobot);
router.delete("/deleteRobot/:id", deleteRobot);

module.exports = router;
