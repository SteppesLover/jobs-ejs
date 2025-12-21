const express = require("express");
require("dotenv").config();
require("express-async-errors");
const passport = require("passport");
const passportInit = require("./passport/passportInit");
const cookieParser = require("cookie-parser");
const csrf = require("host-csrf");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");

const app = express();
app.set("trust proxy", 1);

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(rateLimiter);
app.use(helmet());

app.use(cookieParser(process.env.SESSION_SECRET));

app.use(require("body-parser").urlencoded({ extended: true }));
app.use(xss());

const csrfMiddleware = csrf.csrf();
app.use(csrfMiddleware);

app.use((req, res, next) => {
  if (req.method === "GET") {
    csrf.getToken(req, res); 
  }
  next();
});

app.set("view engine", "ejs");

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});
store.on("error", console.log);

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  sessionParms.cookie.secure = true;
}

app.use(session(sessionParms));

app.use(require("connect-flash")());
app.use(passport.initialize());
app.use(passport.session());
passportInit();

app.use(require("./middleware/storeLocals"));

app.get("/", (req, res) => res.render("index"));
app.use("/sessions", require("./routes/sessionRoutes"));

const auth = require("./middleware/auth");
const secretWordRouter = require("./routes/secretWord");
const jobsRouter = require("./routes/jobs");
app.use("/secretWord", auth, secretWordRouter);
app.use("/jobs", auth, jobsRouter);

app.get("/secretWord", (req, res) => {
  if (!req.session.secretWord) req.session.secretWord = "syzygy";

  res.locals.info = req.flash("info");
  res.locals.errors = req.flash("error");

  res.render("secretWord", { secretWord: req.session.secretWord });
});

app.post("/secretWord", csrfMiddleware, (req, res) => {
  if (req.body.secretWord.toUpperCase().startsWith("P")) {
    req.flash("error", "That word won't work!");
    req.flash("error", "You can't use words that start with p.");
  } else {
    req.session.secretWord = req.body.secretWord;
    req.flash("info", "The secret word was changed.");
  }
  res.redirect("/secretWord");
});

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send(err.message);
});

const port = process.env.PORT || 3001;

const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
