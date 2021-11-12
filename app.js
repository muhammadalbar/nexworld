const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const path = require("path");
const fetch = require("cross-fetch");

const pgdb = require("./db/pg");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const hostname = "0.0.0.0";
const port = process.env.APP_PORT;

const passport = require("passport");
require("./middleware/authGoogle");
require("./middleware/authFacebook");

const pg = require("pg"),
  session = require("express-session"),
  pgSession = require("connect-pg-simple")(session);

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
//Serving Static File
app.use("/public", express.static(path.resolve("./public")));

// ROUTES API
const booth = require("./app/booth/router");
const pic = require("./app/pic/router");
const partner = require("./app/partner/router");
const store = require("./app/store/router");
const banner = require("./app/banner/router");
const annotation = require("./app/annotation/router");
const guest = require("./app/guest/router");
const robot = require("./app/robot/router");

// URL API
const URL = `/api`;
// API
app.use(`${URL}/booths`, booth);
app.use(`${URL}/pics`, pic);
app.use(`${URL}/partners`, partner);
app.use(`${URL}/stores`, store);
app.use(`${URL}/banners`, banner);
app.use(`${URL}/annotations`, annotation);
app.use(`${URL}/guests`, guest);
app.use(`${URL}/robots`, robot);

/*
const cors = require('cors')
app.use(cors())
*/

const { v4: uuidv4 } = require("uuid");

app.use("/", express.static(__dirname + "/views"));
app.engine("html", require("ejs").renderFile);

app.set("views");
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/defaultlayout");
app.set("layout extractScripts", true);

//MIDDLEWARE//
const authMw = require("./middleware/authToken");
app.use(
  session({
    secret: "carbonara2021",
    resave: false,
    saveUninitialized: true,
    cookie: {},
  })
);

//ROUTES//

app.get("/", (req, res) => {
  const session = req.session.user;
  if (session === null || session === undefined) {
    res.render("index", { layout: "layouts/bootstraplayout" });
  } else {
    res.redirect("/virtual");
  }
});
app.get("/logout", (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/");
  });
});

app.get("/special-deal", async (req, res) => {
  try {
    const banner = await fetch(
      process.env.FRONTEND_ADDRESS +
        `/api/banners/getBanners?page=1&perPage=10000`
    );
    const dataBanner = await banner.json();
    res.render("special_deal", {
      layout: "layouts/bootstraplayout",
      banner: dataBanner.data,
    });
  } catch (err) {
    res.send(err.toString());
  }
});

app.get("/partner-smi", async (req, res) => {
  try {
    const banner = await fetch(
      process.env.FRONTEND_ADDRESS +
        `/api/banners/getBanners?page=1&perPage=10000`
    );
    const dataBanner = await banner.json();
    res.render("partner_smi", {
      layout: "layouts/bootstraplayout",
      banner: dataBanner.data,
    });
  } catch (err) {
    res.send(err.toString());
  }
});

app.get("/official-store", async (req, res) => {
  try {
    const banner = await fetch(
      process.env.FRONTEND_ADDRESS +
        `/api/banners/getBanners?page=1&perPage=10000`
    );
    const dataBanner = await banner.json();

    const store = await fetch(
      process.env.FRONTEND_ADDRESS +
        `/api/stores/getStores?page=1&perPage=10000`
    );
    const dataStore = await store.json();

    res.render("official_store", {
      layout: "layouts/bootstraplayout",
      banner: dataBanner.data,
      store: dataStore.data,
    });
  } catch (err) {
    res.send(err.toString());
  }
});

//Auth
app.post("/auth", authMw.authToken, (req, res) => {
  if (req.user.email != req.body.user) {
    res.status(403).send({ error: true, message: "Wrong token" });
  }

  res.send({
    status: "Authorized",
    user: req.user,
  });
});
//

// GOOGLE & FACEBOOK LOGIN

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
app.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: "email" })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/protected",
    failureRedirect: "/",
  })
);
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/dashfacebook",
    failureRedirect: "/",
  })
);
const loginGoogle = require("./routes/signinGoogle");
const loginFacebook = require("./routes/signinFacebook");

app.get("/protected", loginGoogle);
app.get("/dashFacebook", loginFacebook);

// END LOGIN GOOGLE & FACEBOOK

// USER LOGIN
const usersRouter = require("./app/users/router");
app.use("/", usersRouter);
// END USER LOGIN

//Login function SEBELUMNYA
// const login = require("./routes/login");

// app.use("/login", login);

app.post("/logout", async (req, res) => {
  res.send("Logout");
});
//

//Login function
const register = require("./routes/register");

app.use("/register", register);

//

//BOOTHS
const booths = require("./routes/booths");

app.use("/booths", booths);
//

//Annotations
const annotations = require("./routes/annotations");

app.use("/annotations", annotations);
//

//Admin
function adminparsemessage(code) {
  switch (code) {
    case "1":
      return "Wrong account or password";
      break;
    case "2":
      return "Your session has expired, please re-login.";
      break;
  }
}

const admin = require("./routes/admin");
app.get("/adminlogin", (req, res) => {
  res.render("adminlogin", {
    layout: "layouts/emptylayout",
    message: adminparsemessage(req.query.message),
  });
});

app.post("/adminlogin", async (req, res) => {
  try {
    let email = req.body.email;
    let response = await pgdb.getAdmin(email);

    let adminData = response[0];
    let match = await bcrypt.compare(req.body.password, adminData.password);
    if (req.body.email == adminData.email && match) {
      const user = {
        email: adminData.email,
        devicetoken: uuidv4(),
        role: adminData.role,
      };

      const jwtToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "30d",
      });

      res.render("loginform", {
        userkey: "synnex-admin",
        user: adminData.email,
        uid: adminData.uid,
        userid: "admin",
        jwt: jwtToken,
        redirecturl: "/admin/dashboard",
        layout: "layouts/emptylayout",
      });
    } else {
      res.redirect("/adminlogin?message=1");
    }
  } catch (err) {
    res.send(err.toString());
  }
});

app.use("/admin", admin);
//

//Activations
const activation = require("./routes/activation");

app.use("/activation", activation);
//

//Blast reminder email
const blaster = require("./routes/blaster");

app.use("/blaster", blaster);
//

//VIRTUAL PAGES
const virtual = require("./routes/virtual");

app.use("/virtual", virtual);
//

//Message Page
app.get("/message/:color/:message", (req, res) => {
  res.render("message.ejs", {
    color: req.params.color,
    message: req.params.message,
    layout: "layouts/bootstraplayout",
  });
});
//

//Forgot Password Pages
const forgotpassword = require("./routes/forgotpassword");

app.use("/forgotpassword", forgotpassword);
//

//INSERT DATA JOB
const csv = require("csv-parser");

const validator = require("validator");
const fs = require("fs");

const SibApiV3Sdk = require("sib-api-v3-sdk");
const defaultClient = SibApiV3Sdk.ApiClient.instance;

app.get("/sendDataBulk", (req, res) => {
  function sendTokenEmail(email, name, userjwt, token) {
    // Configure API key authorization: api-key
    var apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

    // Uncomment below two lines to configure authorization using: partner-key
    // var partnerKey = defaultClient.authentications['partner-key'];
    // partnerKey.apiKey = 'YOUR API KEY';

    var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

    sendSmtpEmail = {
      to: [
        {
          email: email,
          name: name,
        },
      ],
      templateId: 7,
      params: {
        email: email,
        activationlink:
          process.env.FRONTEND_ADDRESS + "/activation/email/" + userjwt,
        token,
      },
      headers: {
        "X-Mailin-custom":
          "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
      },
    };

    apiInstance.sendTransacEmail(sendSmtpEmail).then(
      function (data) {
        console.log(data);
        return "Registration Successful: " + email;
      },
      function (error) {
        console.log("error :" + error);
        return error;
      }
    );
  }

  fs.createReadStream("data.csv")
    .pipe(csv())
    .on("data", async (row) => {
      try {
        let userToken = row.PASSWORD;
        let salt = await bcrypt.genSalt(saltRounds);
        let hash = await bcrypt.hash(userToken, salt);
        let jwtToken = await jwt.sign(
          {
            email: row.EMAIL,
            password: hash,
            name: row.NAME,
            company: row.COMPANY,
            jobtitle: row.JOBTITLE,
            phone: row.PHONE,
            usertype: "partner",
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "30d" }
        );
        let emailResponse = await sendTokenEmail(
          row.EMAIL,
          row.NAME,
          jwtToken,
          userToken
        );
        console.log({
          error: false,
          user: row.EMAIL,
          userToken: userToken,
          jwt: jwtToken,
        });
      } catch (err) {
        console.log(err);
      }
    })
    .on("end", () => {
      console.log("CSV file successfully processed");
    });
  res.send({ error: false, message: "CSV file successfully processed" });
});

//

//MEDIA FILES PATHS
app.get("/uploads/:file", (req, res) => {
  res.sendFile(path.join(__dirname, "./uploads", req.params.file));
});
//

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
