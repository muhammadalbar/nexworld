var express = require("express");
var router = express.Router();
const { isAllow } = require("../../middleware/authApi");
const {
  getRobots,
  getRobot,
  addRobot,
  addRobotContent,
  updateRobot,
  updateRobotContent,
  deleteRobot,
} = require("./controller");

router.get("/getRobots", getRobots);
router.get("/getRobot/:id", getRobot);

router.use(isAllow);
router.post("/addRobot", addRobot);
router.post("/addRobotContent", addRobotContent);
router.put("/updateRobot/:id", updateRobot);
router.put("/updateRobotContent/:id", updateRobotContent);
router.delete("/deleteRobot/:id", deleteRobot);

module.exports = router;
