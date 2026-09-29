const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");


// Reviews, POST Route
router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview)
);

// Delete Review Route
router.delete(
    "/:reviewId",
    isLoggedIn,
    wrapAsync(isReviewAuthor),
    wrapAsync(reviewController.destroyReview)
);

module.exports = router;