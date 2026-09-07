const mongoose = require('mongoose');

const taskItemSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM'
    },
    plannedPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    actualPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'NOT_STARTED'
    },
    plannedHours: {
      type: Number,
      default: 0,
      min: 0
    },
    actualHours: {
      type: Number,
      default: 0,
      min: 0
    },
    deliverable: {
      type: String,
      default: '',
      trim: true
    }
  },
  { _id: true }
);

const hoursWorkedSchema = new mongoose.Schema(
  {
    development: { type: Number, default: 0, min: 0 },
    testing: { type: Number, default: 0, min: 0 },
    meetings: { type: Number, default: 0, min: 0 },
    documentation: { type: Number, default: 0, min: 0 },
    other: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Report must belong to a user']
    },
    weekStart: {
      type: Date,
      required: [true, 'Week start date is required']
    },
    weekEnd: {
      type: Date,
      required: [true, 'Week end date is required']
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required']
    },
    tasks: {
      type: [taskItemSchema],
      default: []
    },
    plannedTasks: {
      type: String,
      default: '',
      trim: true
    },
    blockers: {
      type: String,
      default: '',
      trim: true
    },
    keyBlocker: {
      type: String,
      default: '',
      trim: true
    },
    achievements: {
      type: String,
      default: '',
      trim: true
    },
    keyAchievement: {
      type: String,
      default: '',
      trim: true
    },
    hoursWorked: {
      type: hoursWorkedSchema,
      default: () => ({})
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'NEEDS_CORRECTION', 'APPROVED'],
      default: 'DRAFT'
    },
    latestReviewComment: {
      type: String,
      default: '',
      trim: true
    },
    submittedAt: {
      type: Date
    },
    approvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Report', reportSchema);
