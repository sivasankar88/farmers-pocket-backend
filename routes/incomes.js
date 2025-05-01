const express = require("express");
const Income = require("../models/Income");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

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

    const incomes = await Income.find(query).sort({ date: -1 });
    const result = incomes.map((data) => {
      return {
        id: data._id,
        date: data.date,
        quantity: data.quantity,
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
    const { cropId, quantity, amount, date, notes } = req.body;
    const income = new Income({
      cropId,
      quantity,
      amount,
      date,
      notes,
    });
    await income.save();
    return res.status(200).json({ message: "income saved" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await Income.findByIdAndDelete(id);
    return res.status(200).json({ message: "income deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error." });
  }
});

module.exports = router;
