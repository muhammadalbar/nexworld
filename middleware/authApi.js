const db = require("../db/db");

module.exports = {
  isAllow: async (req, res, next) => {
    const api_key = req.headers.api_key;
    const user = "admin";
    const admin = await db.query(
      `SELECT * FROM users WHERE uid = $1 AND role = $2`,
      [api_key, user]
    );
    if (admin.rowCount > 0) {
      next();
    } else {
      res.send({ message: `user can't access api` });
    }
  },
};
