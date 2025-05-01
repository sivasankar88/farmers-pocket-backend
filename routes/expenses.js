const express = require("express");
const Expense = require("../models/Expense");
const Crop = require("../models/Crop");

const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authenticate);

router.get("/:id", async (req, res) => {
  try {
    const cropId = req.params.id;
    const { fromDate, toDate } = req.query;
    const query = { cropId: cropId };

    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) query.date.$lte = new Date(toDate);
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    const result = expenses.map((data) => {
      return {
        id: data._id,
        type: data.type,
        date: data.date,
        amount: data.amount,
        notes: data.notes,
      };
    });
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { cropId, type, date, amount, notes } = req.body;
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }
    const expense = new Expense({
      cropId,
      type,
      date,
      amount,
      notes,
    });
    console.log(expense);
    await expense.save();
    res.status(201).json({ message: "expense saved" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await Expense.findByIdAndDelete(id);
    return res.status(200).json({ message: "expense deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error." });
  }
});

module.exports = router;
