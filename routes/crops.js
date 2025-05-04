const express = require("express");
const Crop = require("../models/Crop");
const authenticate = require("../middleware/authMiddleware");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const router = express.Router();

router.use(authenticate);
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { fromDate, toDate, cropId } = req.query;
    const query = { userId: userId };
    if (cropId) query._id = cropId;
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) query.date.$lte = new Date(toDate);
    }
    const crops = await Crop.find(query);
    const cropsWithProfit = await Promise.all(
      crops.map(async (crop) => {
        const expenses = await Expense.find({ cropId: crop._id });
        const incomes = await Income.find({ cropId: crop._id });

        const expenseAmount = expenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );
        const incomeAmount = incomes.reduce(
          (sum, income) => sum + income.quantity * income.amount,
          0
        );
        const profit = incomeAmount - expenseAmount;

        return {
          id: crop._id,
          name: crop.name,
          acre: crop.acres,
          expenseAmount,
          incomeAmount,
          profit,
        };
      })
    );

    return res.status(200).json(cropsWithProfit);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, acres, date } = req.body;
    const userId = req.user.id;
    const crop = new Crop({
      userId: userId,
      name: name,
      acres: Number.parseInt(acres),
      date: date,
    });
    await crop.save();
    return res.status(201).json({ message: "crop added" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await Crop.findByIdAndDelete(id);
    return res.status(200).json({ message: "crop deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error." });
  }
});
module.exports = router;
