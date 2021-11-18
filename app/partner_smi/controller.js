const db = require("../../db/db");
const { v4: uuidv4 } = require("uuid");
const validator = require("validator");

module.exports = {
  getPartners: async (req, res) => {
    const search = req.query.search || null;
    const currentPage = req.query.page || 1;
    const perPage = req.query.perPage || 5;
    let page = (currentPage - 1) * perPage;
    let totalData;
    try {
      if (search) {
        const data = await db.query(
          `SELECT * FROM partner_smi WHERE concat(dealer_name, cust_name, region, team, dropship) ILIKE '%'|| $1 ||'%'`,
          [search]
        );
        totalData = data.rowCount;
        const partner = await db.query(
          `SELECT uid,REPLACE(REPLACE(dealer_name, 'PT. ', ''),'CV. ', '') dealer_name,  code, cust_name, url, dropship, region,team, created_at FROM partner_smi WHERE concat(dealer_name, cust_name, region, team, dropship) ILIKE '%'|| $1 ||'%' ORDER BY dealer_name ASC LIMIT $2 OFFSET $3 `,
          [search, perPage, page]
        );
        if (!Array.isArray(data.rows) || !data.rows.length) {
          res.status(404).json({ message: "Data tidak ditemukan" });
        } else {
          res.status(200).json({
            totalData,
            page: parseInt(currentPage),
            perPage,
            data: partner.rows,
          });
        }
      } else {
        const data = await db.query("SELECT * FROM partner_smi");
        totalData = data.rowCount;

        const partners = await db.query(
          `SELECT uid,REPLACE(REPLACE(dealer_name, 'PT. ', ''),'CV. ', '') dealer_name,code, cust_name, url, dropship, region,team, created_at FROM partner_smi ORDER BY dealer_name ASC LIMIT $1 OFFSET $2`,
          [perPage, page]
        );
        res.status(200).json({
          totalData,
          page: parseInt(currentPage),
          perPage,
          data: partners.rows,
        });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  getPartner: async (req, res) => {
    try {
      const { id } = req.params;
      const partner = await db.query(
        `SELECT * FROM partner_smi WHERE uid = $1`,
        [id]
      );
      if (!partner.rows[0]) {
        res.status(404).json({ message: "Data tidak ditemukan" });
      } else {
        res.status(200).json({ data: partner.rows[0] });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  addPartner: async (req, res) => {
    try {
      const { dealer_name, code, cust_name, url, region, team, dropship } =
        req.body;
      const uid = uuidv4();
      const created_at = new Date();

      await db.query(
        `INSERT into partner_smi (uid, dealer_name, code, cust_name, url, region, team, dropship, created_at) values ($1, $2, $3, $4, $5, $6, $7, $8,$9)`,
        [
          uid,
          dealer_name,
          code,
          cust_name,
          url,
          region,
          team,
          dropship,
          created_at,
        ]
      );

      res
        .status(200)
        .json({ status: "Success", message: "Add Partner SMI Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  updatePartner: async (req, res) => {
    try {
      const { id } = req.params;
      const { dealer_name, code, cust_name, url, region, team, dropship } =
        req.body;

      await db.query(
        `UPDATE partner_smi SET (dealer_name, code, cust_name, url, region, team, dropship) = ($2, $3, $4, $5, $6,$7,$8) where uid = $1`,
        [id, dealer_name, code, cust_name, url, region, team, dropship]
      );
      res
        .status(200)
        .json({ status: "Success", message: "Update Partner SMI Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  deletePartner: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query(`DELETE from partner_smi WHERE uid = $1`, [id]);
      res
        .status(200)
        .json({ status: "Success", message: "Delete Partner SMI Success!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  listRegion: async (req, res) => {
    try {
      const region = await db.query(
        `SELECT DISTINCT UPPER(region) region FROM partner_smi ORDER BY region ASC`
      );
      res.status(200).json({ data: region.rows });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
  getPartnerByRegion: async (req, res) => {
    try {
      const region = req.query.region;
      const data = await db.query(
        `SELECT REPLACE(REPLACE(dealer_name, 'PT. ', ''),'CV. ', '') dealer_name, cust_name, url, dropship, region,team FROM partner_smi WHERE concat(region) ILIKE '%'|| $1 ||'%' ORDER BY dealer_name ASC`,
        [region]
      );
      res.status(200).json({ data: data.rows });
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message || `Terjadi kesalahan pada server` });
    }
  },
};
