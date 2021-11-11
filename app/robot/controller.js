const db = require("../../db/db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const validator = require("validator");

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
        const robot = await db.query(
          "SELECT (robots.uid),boothid,name,title,description FROM robots JOIN booths ON robots.boothid = booths.uid"
        );
        totalData = robot.rowCount;

        const robots = await db.query(
          "SELECT (robots.uid),boothid,name,title,description FROM robots JOIN booths ON robots.boothid = booths.uid LIMIT $1 OFFSET $2",
          [perPage, page]
        );
        const robotContents = await db.query(
          "SELECT (robot_contents.uid),(robot_contents.title),url FROM robots JOIN robot_contents ON robots.uid = robot_contents.robotid"
        );
        res.status(200).json({
          totalData,
          page: parseInt(currentPage),
          perPage,
          data: robots.rows,
        });
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
      const { email, password, name } = req.body;

      const uid = uuidv4();
      const created_at = new Date();
      if (email) {
        if (!validator.isEmail(email)) {
          res.status(500).json({ message: `Format email tidak sesuai` });
        } else {
          if (!password) {
            await db.query(
              `INSERT into guests (uid, email, name, created_at) values ($1, $2, $3, $4)`,
              [uid, email, name, created_at]
            );
          } else {
            let salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(password, salt);
            await db.query(
              `INSERT into guests (uid, email, password, name, created_at) values ($1, $2, $3, $4, $5)`,
              [uid, email, hash, name, created_at]
            );
          }
          res
            .status(200)
            .json({ status: "Success", message: "Add Guest Success!" });
        }
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
      const { email, password, name } = req.body;

      if (email) {
        if (!validator.isEmail(email)) {
          res.status(500).json({ message: `Format email tidak sesuai` });
        } else {
          if (!password) {
            await db.query(
              `UPDATE guests SET (email, name) = ($2, $3) where uid = $1`,
              [id, email, name]
            );
          } else {
            let salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(password, salt);
            await db.query(
              `UPDATE guests SET (email, password, name) = ($2, $3, $4) where uid = $1`,
              [id, email, hash, name]
            );
          }
          res
            .status(200)
            .json({ status: "Success", message: "Update Guest Success!" });
        }
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  deleteRobot: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query(`DELETE from guests WHERE uid = $1`, [id]);
      res
        .status(200)
        .json({ status: "Success", message: "Delete Guest Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  search: async (req, res) => {
    try {
      const query = req.query.search;
      const guest = await db.query(
        `SELECT * FROM guests WHERE concat(email, name) ILIKE '%'|| $1 ||'%'`,
        [query]
      );
      if (!Array.isArray(guest.rows) || !guest.rows.length) {
        res.status(404).json({ message: "Data tidak ditemukan" });
      } else {
        res.status(200).json({ data: guest.rows });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
};
