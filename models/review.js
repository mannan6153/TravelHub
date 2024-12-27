const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  comment: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  listing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  }
});

module.exports = mongoose.model('Review', reviewSchema);
