const express = require("express");
const Income = require("../models/Income");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();
router.use(authenticate);

/**
 * @swagger
 * /api/incomes/{id}:
 *   get:
 *     summary: Get income records for a specific crop
 *     tags: [Incomes]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Crop ID
 *         example: 64c2f41f9a23b4567f4d1234
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter incomes from this date
 *         example: 2025-01-01
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter incomes up to this date
 *         example: 2025-01-31
 *     responses:
 *       200:
 *         description: List of incomes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   quantity:
 *                     type: number
 *                   amount:
 *                     type: number
 *                   notes:
 *                     type: string
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * /api/incomes:
 *   post:
 *     summary: Add a new income record for a crop
 *     tags: [Incomes]
 *     security:
 *       - SessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cropId
 *               - quantity
 *               - amount
 *               - date
 *             properties:
 *               cropId:
 *                 type: string
 *                 example: 64c2f41f9a23b4567f4d1234
 *               quantity:
 *                 type: number
 *                 example: 100
 *               amount:
 *                 type: number
 *                 example: 50
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2025-01-15
 *               notes:
 *                 type: string
 *                 example: Sold at local market
 *     responses:
 *       200:
 *         description: Income saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: income saved
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * /api/incomes/{id}:
 *   delete:
 *     summary: Delete an income record by ID
 *     tags: [Incomes]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Income record ID
 *         example: 64c2f4df9a23b4567f4d5678
 *     responses:
 *       200:
 *         description: Income deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: income deleted
 *       404:
 *         description: Income not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Income not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: server error.
 */

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deleteIncome = await Expense.findByIdAndDelete(id);

    if (!deleteIncome) {
      return res.status(404).json({ message: "Income not found" });
    }
    return res.status(200).json({ message: "income deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error." });
  }
});

module.exports = router;
