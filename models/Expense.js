const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Crop",
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      "ploughing",
      "planting",
      "fertilizer",
      "pesticide",
      "irrigation",
      "harvesting",
      "labor",
      "others",
    ],
  },
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
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

module.exports = mongoose.model("Expense", ExpenseSchema);
