const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: [true, 'Review must reference a report']
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must identify the reviewer']
    },
    action: {
      type: String,
      enum: ['REQUEST_CORRECTION', 'APPROVED'],
      required: [true, 'Review action is required']
    },
    comment: {
      type: String,
      default: '',
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

module.exports = mongoose.model('Review', reviewSchema);
