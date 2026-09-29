const mongoose = require("mongoose");
const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js"); 
const { listingSchema,reviewSchema } = require("./schemas.js");


module.exports.isLoggedIn = (req,res,next) => {

if (!req.isAuthenticated()) {
  // redirect URL
  req.session.redirectUrl = req.originalUrl;
  req.flash("error", "You must be logged in!");
  return res.redirect("/login");
}
next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session && req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req,res,next) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  const currUser = res.locals.currUser || req.user;
  const ownerId = listing.owner && listing.owner._id ? listing.owner._id : listing.owner;
  if (!ownerId || !currUser || !ownerId.equals(currUser._id)) {
    req.flash("error", "You don't have permission to edit or delete this listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    req.flash("error", "Review does not exist!");
    return res.redirect(`/listings/${id}`);
  }
  let review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review does not exist!");
    return res.redirect(`/listings/${id}`);
  }
  const currUser = res.locals.currUser || req.user;
  const authorId = review.author && review.author._id ? review.author._id : review.author;
  if (!authorId || !currUser || !authorId.equals(currUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req,res,next) => {
  let {error} = listingSchema.validate(req.body);
  if (error) {
let errMsg = error.details.map((el) => el.message).join(",");
throw new ExpressError(400,errMsg);
  }else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};