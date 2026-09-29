const express = require("express");
const app = express();
const users = require("./routes/users.js");
const posts = require("./routes/posts.js");
const session = require("express-session");
const flash = require("connect-flash");
const expressSession = require("express-session");
const path = require("path");

app.set("view engine", "ejs");

// Session middleware
const sessionOptions = {
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true,
};

app.use(session(sessionOptions));
app.use(flash());

app.get("/register",(req,res) => {
  let {name = "anonymous"} = req.query;
  req.session.name = name;
  req.flash("success","user registered successfully");
  console.log(req.session.name);
 res.redirect("/hello");
});

app.get("/hello",(req,res ) => {
  res.locals.messages = req.flash("success");
res.render("page.ejs", { name: req.session.name });
});

app.get("/reqcount",(req,res)=> {
    if(req.session.count) {
        req.session.count++;
    }else {
        req.session.count = 1;
    }
    res.send(`you sent a request an ${req.session.count} times`);
});

 // Test route
// app.get("/test", (req, res) => {
//   res.send("test successful");
// });

// Home route
app.get("/", (req, res) => {
  res.send("Hi I am running on server");
});

// Routes
app.use("/users", users);
app.use("/posts", posts);

// Port
const port = 3000;


// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



// const cookieParser = require("cookie-parser");
// app.use(cookieParser("secretcode"));

// app.get("/getsignedcookie",(req,res) => {
//     res.cookie("made-in", INDIA ,{signed:true});
//     res.send("signed cookie sent");
// });
// app.get("/verify",(req,res)=> {
//     console.log(req.cookies);
// res.send("verified");
// });

// app.get("/getcookies",(req,res)=> {
//     res.cookie("greet",hello);
//     res.cookie("madeIn",India);
//     res.send("sent your some cookies!");
// });
// app.get("/",(req,res) => {
//     console.dir(req.cookies);
//     res.send("Hi Im root");
// });




// app.get("/",(req,res) => {
//     res.send("Hi Im running omn server");
// });

// app.use("/users",users);
// app.use("/posts",posts);
