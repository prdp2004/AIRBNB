const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage }) 


router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image][url]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );


// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Edit Route
router.get(
    "/:id/edit",
    isLoggedIn,
    wrapAsync(isOwner),
    wrapAsync(listingController.renderEditForm)
);

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        wrapAsync(isOwner),
         upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        wrapAsync(isOwner),
        wrapAsync(listingController.destroyListing)
    );

    
module.exports = router;
