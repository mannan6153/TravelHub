const Joi = require('joi');

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required().messages({
      'any.required': 'Title is required'
    }),
    description: Joi.string().required().messages({
      'any.required': 'Description is required'
    }),
    location: Joi.string().required().messages({
      'any.required': 'Location is required'
    }),
    country: Joi.string().required().messages({
      'any.required': 'Country is required'
    }),
    image: Joi.string().allow(null, '').messages({
      'string.empty': 'Image must be a string'
    }),
    price: Joi.number().required().min(0).messages({
      'number.min': 'Price must be at least 0',
      'any.required': 'Price is required'
    })
  }).required().messages({
    'any.required': 'Listing data is required'
  })
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5).messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot be more than 5',
      'any.required': 'Rating is required'
    }),
    comment: Joi.string().required().min(10).messages({
      'string.base': 'Comment must be a string',
      'string.empty': 'Comment cannot be empty',
      'string.min': 'Comment must be at least 10 characters long',
      'any.required': 'Comment is required'
    })
  }).required().messages({
    'any.required': 'Review data is required'
  })
});
