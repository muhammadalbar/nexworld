var express = require("express");
var router = express.Router();
const multer = require("multer");
const os = require("os");
const { isAllow } = require("../../middleware/authApi");
const {
  getStores,
  getStore,
  addStore,
  updateStore,
  deleteStore,
  search,
} = require("./controller");

router.get("/", search);
router.get("/getStores", getStores);
router.get("/getStore/:id", getStore);

router.use(isAllow);
router.post(
  "/addStore",
  multer({ dest: os.tmpdir() }).single("image"),
  addStore
);
router.put(
  "/updateStore/:id",
  multer({ dest: os.tmpdir() }).single("image"),
  updateStore
);
router.delete("/deleteStore/:id", deleteStore);

module.exports = router;
