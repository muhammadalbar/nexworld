const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const pgdb = require("../../db/pg");
const db = require("../../db/db");
const validator = require("validator");
const jwt = require("jsonwebtoken");
module.exports = {
  actionSignin: async (req, res) => {
    try {
      const email = req.body.email;
      const name = req.body.name;
      let uid = uuidv4();
      let register_date = new Date();
      let role = "user";
      let userkey = "synnex";
      let login = "synnex";

      let response = await pgdb.getGuest(email);

      if (response.length == 0) {
        await db.query(
          `INSERT into guests (uid, email, role, name, register_date, login) values ($1, $2, $3, $4, $5,$6)`,
          [uid, email, role, name, register_date, login]
        );
        const user = {
          email: email,
          devicetoken: uuidv4(),
          role: "user",
        };

        const jwtToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "30d",
        });
        req.session.user = {
          user: email,
          jwt: jwtToken,
        };
        res.header("auth-header", jwtToken).render("loginredirect", {
          layout: "layouts/bootstraplayout",
          userkey: "synnex",
          user: email,
          username: name,
          userid: uid,
          jwt: jwtToken,
          redirecturl: "/virtual",
        });
      } else {
        const user = {
          email: email,
          devicetoken: uuidv4(),
          role: "user",
        };

        const jwtToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "30d",
        });
        req.session.user = {
          user: email,
          jwt: jwtToken,
        };
        res.header("auth-header", jwtToken).render("loginredirect", {
          layout: "layouts/bootstraplayout",
          userkey: "synnex",
          user: email,
          username: name,
          userid: uid,
          jwt: jwtToken,
          redirecturl: "/virtual",
        });
      }
    } catch (err) {
      res.redirect("/", `${err.message}`);
    }
  },

  logout: (req, res) => {
    req.session.destroy();
    res.redirect("/");
  },
};
