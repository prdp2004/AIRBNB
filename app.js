if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const { MongoStore }= require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const dbUrl = process.env.ATLASDB_URL;

// || process.env.DATABASE_URL || process.env.MONGO_URL;

const port = process.env.PORT || 8080;
const secret = process.env.SECRET || process.env.SESSION_SECRET || "mysupersecretcode";

async function main() {
  if (!dbUrl) {
    throw new 
    Error("Missing ATLASDB_URL in .env.");
  }try {
  await mongoose.connect(dbUrl);
  console.log("MongoDB Atlas is connected Successfully");
} catch (err) {
  console.error("MongoDB connection error:",err );
}
}
main();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

 const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto : {
    secret: "secret"
  },
  touchAfter : 24*3600
 });
store.on("error",() => {
  console.log("ERROR in Mongo session store:", err);
});

const sessionOptions = {
  store,
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/demouser", async (req, res, next) => {
  try {
    let existing = await User.findOne({ username: "delta-student" });
    if (existing) {
      return res.send(existing);
    }
    let fakeUser = new User({
      email: "student@gmail.com",
      username: "delta-student",
    });
    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);
  } catch (e) {
    next(e);
  }
});

// Root Route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Privacy & Terms Routes
app.get("/privacy", (req, res) => {
  res.render("listings/privacy.ejs");
});

app.get("/terms", (req, res) => {
  res.render("listings/terms.ejs");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// 404 Catch-All Route
app.all("/{*splat}", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Central Error Handling Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500 } = err;
  let code = typeof statusCode === "number" && statusCode >= 100 && statusCode <= 599 ? statusCode : 500;
  let message = err.message || "Something went wrong!";
  res.status(code).render("error.ejs", { message });
});

main()
  .then(() => {
    console.log("connected to DB");
    app.listen(port, () => {
      console.log(`Server is running on ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exitCode = 1;
  });

module.exports = app;
