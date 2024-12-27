const mongoose = require("mongoose");
const initData = require("./data.js"); // Ensure the path is correct
const Listing = require("../models/listing.js"); // Adjust the path if necessary

const MONGO_URL = "mongodb://127.0.0.1:27017/TravelHub"; // Your MongoDB URL

main()
  .then(() => {
    console.log("Connected to DB");
    initDB(); // Call the function to initialize the data after connection
  })
  .catch((err) => {
    console.log("Error connecting to DB:", err);
  });

// Function to connect to MongoDB
async function main() {
  await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
}

// Function to initialize the database
const initDB = async () => {
  try {
    await Listing.deleteMany({}); // Delete existing data
    console.log("Existing data deleted");

    // Remove _id field from data if present
    const dataToInsert = initData.data.map(item => {
      const { _id, ...rest } = item; // Exclude _id if present
      return rest;
    });

    await Listing.insertMany(dataToInsert); // Insert new data
    console.log("Data initialized successfully");
  } catch (error) {
    console.error("Error initializing data:", error);
  }
};
