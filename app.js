const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const Review = require("./models/review"); // Import Review model
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const validateListing = require('./middleware/validateListing');
const validateReview = require('./middleware/validateReview'); // Import validateReview middleware
const cookieParser = require('cookie-parser'); // Add cookie-parser

// MongoDB URL
const MONGO_URL = "mongodb://127.0.0.1:27017/TravelHub";

// Connect to MongoDB
async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

// Set up EJS as the view engine
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add this line to parse JSON data
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));  // Serve static files
app.use(cookieParser()); // Use cookie-parser

// Logging middleware
app.use((req, res, next) => {
  console.log("Incoming request method:", req.method);
  console.log("Incoming request URL:", req.url);
  console.log("Incoming request data:", req.body);
  console.log("Cookies:", req.cookies); // Log cookies
  next();
});

// Root Route
app.get("/", (req, res) => {
  res.cookie('userVisit', 'true', { maxAge: 900000, httpOnly: true });
  console.log("Cookie 'userVisit' has been set.");
  res.send("Hi, I am root. Cookie has been set!");
});

// Index Route - Show all listings
app.get("/listings", wrapAsync(async (req, res, next) => {
  const allListings = await Listing.find({});
  console.log(allListings);  // Check the logs to see if data is being fetched correctly
  res.render("listings/index", { allListings });
}));

// New Route - Form to create new listing
app.get("/listings/new", (req, res) => {
  res.render("listings/new");
});

// Show Route - Show specific listing
app.get("/listings/:id", wrapAsync(async (req, res, next) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError('Invalid Listing ID', 400);
  }
  const listing = await Listing.findById(id).populate('reviews');
  if (!listing) {
    throw new ExpressError('Listing not found', 404);
  }

  // Check if the userVisit cookie is set
  if (req.cookies.userVisit) {
    console.log('User has visited before.');
  } else {
    console.log('User is visiting for the first time.');
  }

  res.render("listings/show", { listing });
}));

// Create Route - Add new listing to DB
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
  console.log("Form data received on /listings POST:", req.body);
  const newListing = new Listing(req.body.listing);

  // Set default image if none provided
  if (!newListing.image || newListing.image === '') {
    newListing.image = "http://example.com/default-image.jpg"; // Replace with your default image URL
  }

  await newListing.save();
  res.redirect("/listings");
}));

// Create Review Route - Add a new review to a listing
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res, next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError('Listing not found', 404);
  }
  console.log("Review Data Received:", req.body.review); // Log review data
  const review = new Review(req.body.review);
  review.listing = id;  // Associate review with listing by ID
  listing.reviews.push(review);
  await review.save();
  await listing.save();
  res.redirect(`/listings/${id}`);
}));

// Edit Route - Form to edit specific listing
app.get("/listings/:id/edit", wrapAsync(async (req, res, next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError('Listing not found', 404);
  }
  res.render("listings/edit", { listing });
}));

// Update Route - Update specific listing in DB
app.put("/listings/:id", validateListing, wrapAsync(async (req, res, next) => {
  let { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (!listing) {
    throw new ExpressError('Listing not found', 404);
  }
  res.redirect(`/listings/${id}`);
}));

// Delete Route - Delete specific listing from DB
app.delete("/listings/:id", wrapAsync(async (req, res, next) => {
  let { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) {
    throw new ExpressError('Listing not found', 404);
  }
  console.log(deletedListing);
  res.redirect("/listings");
}));

// Delete Route - Delete specific review from a listing
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res, next) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
}));

// Handle all other routes
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  console.log("Error Handler Triggered: ", err); // Debugging line
  res.status(statusCode).render("error", { error: err });
});

// Route to trigger an error manually for testing
app.get("/trigger-error", (req, res) => {
  throw new ExpressError("Manually triggered error!", 500);
});

// Start the server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
