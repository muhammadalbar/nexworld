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
          "SELECT (robots.uid),boothid,name,title,description,url FROM robots JOIN booths ON robots.boothid = booths.uid WHERE concat(name,title) ILIKE '%'|| $1 ||'%'",
          [search]
        );
        totalData = data.rowCount;
        const robot = await db.query(
          `SELECT (robots.uid),boothid,name,title,description,url FROM robots JOIN booths ON robots.boothid = booths.uid WHERE concat(name,title) ILIKE '%'|| $1 ||'%' LIMIT $2 OFFSET $3`,
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
            "SELECT (robots.uid),boothid,name,title,description,url FROM robots JOIN booths ON robots.boothid = booths.uid"
          );
          totalData = robot.rowCount;

          const robots = await db.query(
            "SELECT (robots.uid),boothid,name,title,description,url FROM robots JOIN booths ON robots.boothid = booths.uid ORDER BY name ASC LIMIT $1 OFFSET $2",
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
            "SELECT (robots.uid),boothid,name,title,description,url FROM robots JOIN booths ON robots.boothid = booths.uid"
          );
          totalData = robot.rowCount;

          const robots = await db.query(
            "SELECT (robots.uid),boothid,name,title,description,url FROM robots JOIN booths ON robots.boothid = booths.uid"
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
        `SELECT (robots.uid),boothid,name,title,description,url FROM robots JOIN booths ON robots.boothid = booths.uid WHERE robots.uid = $1`,
        [id]
      );
      const robotContents = await db.query(
        "SELECT uid,title,url,sort_number FROM robot_contents WHERE robotid = $1 ORDER BY sort_number ASC",
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
      const { title, description, boothid, url } = req.body;
      const uid = uuidv4();
      const created_at = new Date();

      await db.query(
        `INSERT into robots (uid,title,description,boothid,created_at,url) values ($1, $2,$3,$4,$5,$6)`,
        [uid, title, description, boothid, created_at, url]
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
      const { title, url, robotid, sort_number } = req.body;
      const uid = uuidv4();
      const created_at = new Date();

      const data = await db.query(
        `SELECT * FROM robot_contents WHERE robotid = $1`,
        [robotid]
      );
      if (data.rowCount >= 5) {
        res.status(500).json({
          status: "Failed",
          message: "Data Content Robot is maximum!",
        });
      } else {
        await db.query(
          `INSERT into robot_contents (uid,title,url,robotid,created_at, sort_number) values ($1, $2,$3,$4,$5,$6)`,
          [uid, title, url, robotid, created_at, sort_number]
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
      const { title, description, url } = req.body;

      await db.query(
        `UPDATE robots SET (title, description,url) = ($2, $3, $4) where uid = $1`,
        [id, title, description, url]
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
      const { title, url, sort_number } = req.body;

      await db.query(
        `UPDATE robot_contents SET (title, url, sort_number) = ($2, $3, $4) where uid = $1`,
        [id, title, url, sort_number]
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
  deleteRobotContent: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query(`DELETE from robot_contents WHERE uid = $1`, [id]);
      res
        .status(200)
        .json({ status: "Success", message: "Delete Robot Content Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
};
