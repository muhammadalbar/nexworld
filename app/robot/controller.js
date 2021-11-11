const db = require("../../db/db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const validator = require("validator");
const TransactionalEmailsApi = require("sib-api-v3-sdk/src/api/TransactionalEmailsApi");

module.exports = {
  getRobots: async (req, res) => {
    const search = req.query.search || null;
    const currentPage = req.query.page || 1;
    const perPage = req.query.perPage || 5;
    let page = (currentPage - 1) * perPage;
    let totalData;
    try {
      if (search) {
        const data = await db.query(
          "SELECT (robots.uid),boothid,name,title,description FROM robots JOIN booths ON robots.boothid = booths.uid WHERE concat(name,title) ILIKE '%'|| $1 ||'%'",
          [search]
        );
        totalData = data.rowCount;
        const robot = await db.query(
          `SELECT (robots.uid),boothid,name,title,description FROM robots JOIN booths ON robots.boothid = booths.uid WHERE concat(name,title) ILIKE '%'|| $1 ||'%' LIMIT $2 OFFSET $3`,
          [search, perPage, page]
        );
        if (!Array.isArray(data.rows) || !data.rows.length) {
          res.status(404).json({ message: "Data tidak ditemukan" });
        } else {
          res.status(200).json({
            totalData,
            page: parseInt(currentPage),
            perPage,
            data: robot.rows,
          });
        }
      } else {
        if (perPage >= 0) {
          const robot = await db.query(
            "SELECT (robots.uid),boothid,name,title,description FROM robots JOIN booths ON robots.boothid = booths.uid"
          );
          totalData = robot.rowCount;

          const robots = await db.query(
            "SELECT (robots.uid),boothid,name,title,description FROM robots JOIN booths ON robots.boothid = booths.uid LIMIT $1 OFFSET $2",
            [perPage, page]
          );
          res.status(200).json({
            totalData,
            page: parseInt(currentPage),
            perPage,
            data: robots.rows,
          });
        } else {
          const robot = await db.query(
            "SELECT (robots.uid),boothid,name,title,description FROM robots JOIN booths ON robots.boothid = booths.uid"
          );
          totalData = robot.rowCount;

          const robots = await db.query(
            "SELECT (robots.uid),boothid,name,title,description FROM robots JOIN booths ON robots.boothid = booths.uid"
          );
          res.status(200).json({
            totalData,
            page: parseInt(currentPage),
            perPage,
            data: robots.rows,
          });
        }
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  getRobot: async (req, res) => {
    try {
      const { id } = req.params;
      const robot = await db.query(
        `SELECT (robots.uid),boothid,name,title,description FROM robots JOIN booths ON robots.boothid = booths.uid WHERE robots.uid = $1`,
        [id]
      );
      const robotContents = await db.query(
        "SELECT uid,title,url FROM robot_contents WHERE robotid = $1",
        [id]
      );
      const obj1 = robot.rows[0];
      const obj2 = { contents: robotContents.rows };
      const data = Object.assign(obj1, obj2);
      if (!robot.rows[0]) {
        res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.status(200).json({ data });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  addRobot: async (req, res) => {
    try {
      const { title, description, boothid } = req.body;
      const uid = uuidv4();
      const created_at = new Date();

      await db.query(
        `INSERT into robots (uid,title,description,boothid,created_at) values ($1, $2,$3,$4,$5)`,
        [uid, title, description, boothid, created_at]
      );
      res
        .status(200)
        .json({ status: "Success", message: "Add Robot Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  addRobotContent: async (req, res) => {
    try {
      const { title, url, robotid } = req.body;
      const uid = uuidv4();
      const created_at = new Date();

      const data = await db.query(
        `SELECT * FROM robot_contents WHERE robotid = $1`,
        [robotid]
      );
      if (data.rowCount >= 4) {
        res.status(500).json({
          status: "Failed",
          message: "Data Content Robot is maximum!",
        });
      } else {
        await db.query(
          `INSERT into robot_contents (uid,title,url,robotid,created_at) values ($1, $2,$3,$4,$5)`,
          [uid, title, url, robotid, created_at]
        );
        res.status(200).json({
          status: "Success",
          message: "Add Content Robot Success!",
          data,
        });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  updateRobot: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description } = req.body;

      await db.query(
        `UPDATE robots SET (title, description) = ($2, $3) where uid = $1`,
        [id, title, description]
      );
      res
        .status(200)
        .json({ status: "Success", message: "Update Robot Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  updateRobotContent: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, url } = req.body;

      await db.query(
        `UPDATE robot_contents SET (title, url) = ($2, $3) where uid = $1`,
        [id, title, url]
      );
      res
        .status(200)
        .json({ status: "Success", message: "Update Content Robot Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  deleteRobot: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query(`DELETE from robots WHERE uid = $1`, [id]);
      await db.query(`DELETE from robot_contents WHERE robotid = $1`, [id]);
      res
        .status(200)
        .json({ status: "Success", message: "Delete Robot Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
};
