const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js"); 
const User = require("../models/user.js");

const MONGO_URL = process.env.ATLASDB_URL || process.env.DATABASE_URL || process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");
  await initDB();
  await mongoose.disconnect();
  console.log("Database connection closed");
}

const initDB = async () => {
  await Listing.deleteMany({});
  
  // Find an existing user or fallback to known ID
  let owner = await User.findOne({});
  let ownerId = owner ? owner._id : "6aafba5f93c30d9b8d5625d0";

  initData.data = initData.data.map((obj) => ({ ...obj, owner: ownerId }));
  await Listing.insertMany(initData.data);
  console.log("Data was initialized successfully with owner:", ownerId);
};

main().catch((err) => {
  console.error("Initialization error:", err);
});