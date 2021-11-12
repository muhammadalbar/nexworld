const db = require("../db/db");

module.exports = {
  isAllow: async (req, res, next) => {
    const api_key = req.headers.api_key;
    const admin = await db.query(
      `SELECT * FROM users WHERE uid = $1 AND role = 'admin'`,
      [api_key]
    );
    if (admin.rowCount == 0) {
      res.send({ admin, message: `user can't access api` });
    } else {
      next();
    }
  },
};
