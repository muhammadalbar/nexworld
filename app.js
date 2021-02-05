const express = require('express');
const app = express();

const pgdb = require('./db/pg');
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');

const hostname = '127.0.0.1';
const port = 3000;

const pg = require('pg')
  , session = require('express-session')
  , pgSession = require('connect-pg-simple')(session);

const bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

const { v4: uuidv4 } = require('uuid');
 
 //SESSION
 //
 /*
const pgPool = new pg.Pool({
    user: process.env.PG_USER,
	host: process.env.PG_HOST,
	database: process.env.PG_DB,
	password: process.env.PG_PASS,
	port: process.env.PG_PORT,
});
 
app.use(session({
  store: new pgSession({
    pool : pgPool,                
    tableName : 'session'   
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 days
}));
*/
//

//MIDDLEWARE//

function authToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if(token == null) return res.sendStatus(401);

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if(err){
			res.status(403).send(err.toString());
		}
		req.user = user;
		next()
	})
}

//ROUTES//

app.get('/', function (req, res) {
  res.send('EXHIBITION CMS BACKEND')
})

//Login function
const login = require('./routes/login')

app.use('/login', login);

app.post('/logout', async(req,res)=> {
	res.send('Logout')
})
//

//BOOTHS
const booths = require('./routes/booths')

app.use('/booths',authToken, booths);
//

//Annotations
const annotations = require('./routes/annotations')

app.use('/annotations', authToken, annotations);
//
 
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});