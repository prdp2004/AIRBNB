const mongoose = require("mongoose");
const Listing = require("../models/listing"); 
const maxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = maxGeocoding ({accessToken : mapToken});


  module.exports.index= async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  };

 module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

  module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {
      listing,
      mapToken: process.env.MAP_TOKEN || "",
    });
  };

  module.exports.createdListing = async (req, res,next) => {
let geometry;
if (mapToken) {
  try {
    const response = await geocodingClient.forwardGeocode({
      query: [req.body.listing.location, req.body.listing.country].filter(Boolean).join(", "),
      limit: 1,
    }).send();
    geometry = response.body?.features?.[0]?.geometry;
    if (!geometry || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2) {
      console.warn("Mapbox did not return coordinates for this listing location.");
      geometry = undefined;
    }
  } catch (error) {
    console.error("Listing geocoding failed:", error.message);
  }
}

    if (req.file) {
      req.body.listing.image = {
        filename: req.file.filename,
        url: req.file.path,
      };
    }
    if (typeof req.body.listing.image === "string") {
      req.body.listing.image = { url: req.body.listing.image };
    }
    const newListing = new Listing(req.body.listing);
    if (geometry) newListing.geometry = geometry;
    newListing.owner = req.user._id;

// newListing.geometry = response.body.features[0].geometry;

let savedListing = await newListing.save();
console.log(savedListing);
    req.flash("success", geometry ? "New Listing Created!" : "New Listing Created! Map coordinates could not be found.");
    res.redirect("/listings");
  };
  module.exports.createListing = module.exports.createdListing;

  module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
   let originalImageUrl = listing.image.url;
   originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs", { listing ,originalImageUrl});
  };

  module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    const existingListing = await Listing.findById(id);
    if (!existingListing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    if (typeof req.body.listing.image === "string") {
      req.body.listing.image = { url: req.body.listing.image };
    }
    if (req.body.listing.image && (!req.body.listing.image.url || req.body.listing.image.url.trim() === "")) {
      req.body.listing.image.url = existingListing.image?.url;
    }
    let listing = await Listing.findByIdAndUpdate
    (id, { ...req.body.listing }, { runValidators: true });

    if (typeof req.file !== "undefined") {
let url = req.file.path;
let filename = req.file.filename;
listing.image = {url,filename};
await listing.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
  };

 module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  };
