const db = require("../../db/db");
const { v4: uuidv4 } = require("uuid");
const validator = require("validator");
const path = require("path");
const fs = require("fs");
const config = require("../../config/config");

module.exports = {
  getBanners: async (req, res) => {
    const search = req.query.search || null;
    const currentPage = req.query.page || 1;
    const perPage = req.query.perPage || 5;
    let page = (currentPage - 1) * perPage;
    let totalData;
    try {
      if (search) {
        const data = await db.query(
          "SELECT * FROM banners WHERE concat(name, url, image) ILIKE '%'|| $1 ||'%'",
          [search]
        );
        totalData = data.rowCount;
        const banner = await db.query(
          `SELECT * FROM banners WHERE concat(name, url, image) ILIKE '%'|| $1 ||'%' LIMIT $2 OFFSET $3`,
          [search, perPage, page]
        );
        if (!Array.isArray(data.rows) || !data.rows.length) {
          res.status(404).json({ message: "Data tidak ditemukan" });
        } else {
          res.status(200).json({
            totalData,
            page: parseInt(currentPage),
            perPage,
            data: banner.rows,
          });
        }
      } else {
        const data = await db.query("SELECT * FROM Banners ");
        totalData = data.rowCount;
        const banners = await db.query(
          "SELECT * FROM banners LIMIT $1 OFFSET $2",
          [perPage, page]
        );
        res.status(200).json({
          totalData,
          page: parseInt(currentPage),
          perPage,
          data: banners.rows,
        });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  getBanner: async (req, res) => {
    try {
      const { id } = req.params;
      const banner = await db.query(`SELECT * FROM banners WHERE uid = $1`, [
        id,
      ]);
      if (!banner.rows[0]) {
        res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.status(200).json({ data: banner.rows[0] });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  addBanner: async (req, res) => {
    try {
      const { name, url } = req.body;
      const uid = uuidv4();
      const created_at = new Date();

      if (req.file) {
        let tmp_path = req.file.path;
        let originaExt =
          req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
          ];
        let filename = req.file.filename + "." + originaExt;
        let target_path = path.resolve(
          config.rootPath,
          `public/banner/${filename}`
        );

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);

        src.pipe(dest);

        src.on("end", async () => {
          try {
            const image = filename;
            const imageurl = `/public/banner/${filename}`;
            await db.query(
              `INSERT into banners (uid, name, url, image, created_at, imageurl) values ($1, $2, $3, $4, $5, $6)`,
              [uid, name, url, image, created_at, imageurl]
            );

            res
              .status(200)
              .json({ status: "Success", message: "Add Banner Success!" });
          } catch (err) {
            res.status(500).json({
              message: err.message || `Terjadi kesalahan pada server`,
            });
          }
        });
      } else {
        await db.query(
          `INSERT into banners (uid, name, url,  created_at) values ($1, $2, $3, $4)`,
          [uid, name, url, created_at]
        );
        res
          .status(200)
          .json({ status: "Success", message: "Add Banner Success!" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  updateBanner: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, url } = req.body;

      if (req.file) {
        let tmp_path = req.file.path;
        let originaExt =
          req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
          ];
        let filename = req.file.filename + "." + originaExt;
        let target_path = path.resolve(
          config.rootPath,
          `public/banner/${filename}`
        );

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);

        src.pipe(dest);

        src.on("end", async () => {
          const image = filename;
          const imageurl = `/public/banner/${filename}`;

          const imageStore = await db.query(
            `SELECT * FROM banners WHERE uid = $1`,
            [id]
          );
          let currentImage = `${config.rootPath}/public/banner/${imageStore.rows[0].image}`;
          try {
            await db.query(
              `UPDATE banners SET (name,url,image, imageurl) = ($2, $3, $4, $5) where uid = $1`,
              [id, name, url, image, imageurl]
            );
            if (fs.existsSync(currentImage)) {
              fs.unlinkSync(currentImage);
            }
            res
              .status(200)
              .json({ status: "Success", message: "Update Banner Success!" });
          } catch (err) {
            res.status(500).json({
              message: err.message || `Terjadi kesalahan pada server`,
            });
          }
        });
      } else {
        await db.query(
          `UPDATE banners SET (name,url) = ($2, $3) where uid = $1`,
          [id, name, url]
        );
        res
          .status(200)
          .json({ status: "Success", message: "Update Banner Success!" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  deleteBanner: async (req, res) => {
    try {
      const { id } = req.params;
      const imageStore = await db.query(
        `SELECT * FROM banners WHERE uid = $1`,
        [id]
      );
      await db.query(`DELETE from banners WHERE uid = $1`, [id]);
      let currentImage = `${config.rootPath}/public/banner/${imageStore.rows[0].image}`;
      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }
      res
        .status(200)
        .json({ status: "Success", message: "Delete Banner Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  search: async (req, res) => {
    try {
      const query = req.query.search;
      const store = await db.query(
        `SELECT * FROM banners WHERE concat(name, url, image) ILIKE '%'|| $1 ||'%'`,
        [query]
      );
      if (!Array.isArray(store.rows) || !store.rows.length) {
        res.status(404).json({ message: "Data tidak ditemukan" });
      } else {
        res.status(200).json({ data: store.rows });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
};
