const mongoose = require("mongoose");

const IncomeSchema = new mongoose.Schema({
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Crop",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Income", IncomeSchema);
