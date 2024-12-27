const { listingSchema } = require('../schema'); // Import the Joi schema
const ExpressError = require('../utils/ExpressError'); // Import the custom error class

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    console.log('Validation Error:', msg); // Debugging log
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports = validateListing;
