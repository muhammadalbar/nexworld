const db = require("../../db/db");
const { v4: uuidv4, stringify } = require("uuid");

module.exports = {
  getBooths: async (req, res) => {
    const search = req.query.search || null;
    const currentPage = req.query.page || 1;
    const perPage = req.query.perPage || 5;
    let page = (currentPage - 1) * perPage;
    let totalData;
    try {
      if (search) {
        const data = await db.query(
          `SELECT * FROM booths WHERE concat(name, number) ILIKE '%'|| $1 ||'%'`,
          [search]
        );
        totalData = data.rowCount;
        const booth = await db.query(
          `SELECT * FROM booths WHERE concat(name, number) ILIKE '%'|| $1 ||'%' LIMIT $2 OFFSET $3`,
          [search, perPage, page]
        );
        if (!Array.isArray(data.rows) || !data.rows.length) {
          res.status(404).json({ message: "Data tidak ditemukan" });
        } else {
          res.status(200).json({
            totalData,
            page: parseInt(currentPage),
            perPage,
            data: booth.rows,
          });
        }
      } else {
        const booths = await db.query("SELECT * FROM booths");
        totalData = booths.rowCount;

        const booth = await db.query(
          "SELECT * FROM booths  LIMIT $1 OFFSET $2 ",
          [perPage, page]
        );
        res.status(200).json({
          totalData,
          page: parseInt(currentPage),
          perPage,
          data: booth.rows,
        });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  getBooth: async (req, res) => {
    try {
      const { id } = req.params;
      const booth = await db.query(`SELECT * FROM booths WHERE uid = $1`, [id]);
      if (!booth.rows[0]) {
        res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.status(200).json({ data: booth.rows[0] });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  addBooth: async (req, res) => {
    try {
      const { number, name } = req.body;
      const uid = uuidv4();
      await db.query(
        `INSERT into booths (uid, number, name) values ($1, $2, $3)`,
        [uid, number, name]
      );
      res
        .status(200)
        .json({ status: "Success", message: "Add Booth Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  updateBooth: async (req, res) => {
    try {
      const { id } = req.params;
      const { number, name } = req.body;
      await db.query(
        `UPDATE booths SET (number, name) = ($2, $3) where uid = $1`,
        [id, number, name]
      );
      res
        .status(200)
        .json({ status: "Success", message: "Update Booth Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  deleteBooth: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query(`DELETE from booths WHERE uid = $1`, [id]);
      res
        .status(200)
        .json({ status: "Success", message: "Delete Booth Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  search: async (req, res) => {
    try {
      const query = req.query.search;
      const booth = await db.query(
        `SELECT * FROM booths WHERE concat(name, number) ILIKE '%'|| $1 ||'%'`,
        [query]
      );
      if (!Array.isArray(booth.rows) || !booth.rows.length) {
        res.status(404).json({ message: "Data tidak ditemukan" });
      } else {
        res.status(200).json({ data: booth.rows });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
};
