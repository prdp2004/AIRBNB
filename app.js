const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");


const MONGO_URL =  "mongodb://127.0.0.1:27017/wanderlust" ;

main().then(() => {
    console.log("connected to DB");
})
.catch ((err) => {
    console.log(err);
});


async function main() {
    await mongoose.connect(MONGO_URL );
}

app.set("view engine" ,"ejs");
app.set("views", path.join(__dirname , "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static (path.join(__dirname , "init", "public")));

app.get("/" , async (req,res) => {
    res.send("Hi I'm server root" );
});

// Index Route
app.get("/listings" , async (req,res) => {
const allListings = await Listing.find({});
res.render("listings/index.ejs", {allListings});
});

//New route
app.get("/listings/new",(req,res) => {
    res.render( "listings/new.ejs");
});


// Show Route
app.get("/listings/:id" ,async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});
// Create Route
app.post("/listings",async(req,res) =>{
    console.log("BODY:", req.body);
    const newListing = new Listing(req.body.listing);
    console.log("NEW LISTING:",newListing);
    await newListing.save();
    res.redirect(`/listings/${newListing._id}`);

});
//Edit Routegit
app.get("/listings/:id/edit" , async (req,res) => {
    let {id}= req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});

// Update Route
app.put("/listings/:id", async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{ ...req.body.listing });
    res.redirect("/listings");
});

//DELETE Route
app.delete("/listings/:id", async(req,res) => {
    let {id}  = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
});



// app.get("/testListing", async (req,res) => {
// let sampleListing = new Listing ({
// title : "my new images",
// description: "by the view",
// price : 12598,
// location : "Edinburgh",
// country : "Neetherland"
// });

// await sampleListing.save();
// console.log("sample was saved");
// res.send("successful testing");

// });


app.listen(8080 , () => {
    console.log("Server is running on 8080");
});
