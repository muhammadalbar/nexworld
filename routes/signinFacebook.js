const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const pgdb = require("../db/pg");
const db = require("../db/db");
const validator = require("validator");
const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}
router.get("/dashFacebook", isLoggedIn, async (req, res) => {
  try {
    //EMAIL VALIDATION
    const checkemail = req.user.emails;

    if (!checkemail) {
      let email = req.user.id;
      let name = req.user.displayName;
      // let props = { name: req.user.displayName };
      let uid = uuidv4();
      let register_date = new Date();
      let role = "user";
      let userkey = "synnex";
      let login = "facebook";
      //
      let response = await pgdb.getGuest(email);

      if (response.length == 0) {
        await db.query(
          `INSERT into guests (uid, email, role, name, register_date, login) values ($1, $2, $3, $4, $5, $6)`,
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
        res.render("loginredirect", {
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
        res.render("loginredirect", {
          layout: "layouts/bootstraplayout",
          userkey: "synnex",
          user: email,
          username: name,
          userid: uid,
          jwt: jwtToken,
          redirecturl: "/virtual",
        });
      }
    } else {
      let getemail = req.user.emails.map(({ value }) => value);
      let email = getemail[0];
      let name = req.user.displayName;
      // let props = { name: req.user.displayName };
      let uid = uuidv4();
      let register_date = new Date();
      let role = "user";
      let userkey = "synnex";
      let login = "facebook";

      let response = await pgdb.getGuest(email);

      if (response.length == 0) {
        await db.query(
          `INSERT into guests (uid, email, role, name, register_date, login) values ($1, $2, $3, $4, $5, $6)`,
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
        res.render("loginredirect", {
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
        res.render("loginredirect", {
          layout: "layouts/bootstraplayout",
          userkey: "synnex",
          user: email,
          username: name,
          userid: uid,
          jwt: jwtToken,
          redirecturl: "/virtual",
        });
      }
    }
  } catch (err) {
    res.status(500).send({ error: true, message: err.toString() });
  }
});
module.exports = router;
