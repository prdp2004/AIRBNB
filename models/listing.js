const mongoose = require("mongoose");
const Review = require("./review.js");
const User = require("./user.js");
const Schema = mongoose.Schema;

const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60";

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        filename : String,
        url : String,
        },
    price: {
        type: Number,
        min: [0, "Price must be a positive number"],
    },
    location: String,
    country: String,
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
            required:true,
        },
        coordinates: {
            type: [Number],
            required:true,
            default:undefined,
        },
    },
    reviews : [
{
type: Schema.Types.ObjectId,
ref : "Review",

},
    ],
owner:  {
    type : Schema.Types.ObjectId,
    ref : "User", 
},

});

listingSchema.post("findOneAndDelete",async(listing) => {
  if (listing) { 
     await Review.deleteMany({_id:{$in:listing.reviews}});
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
