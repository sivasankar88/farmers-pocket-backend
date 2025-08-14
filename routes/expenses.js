const express = require("express");
const Expense = require("../models/Expense");
const Crop = require("../models/Crop");

const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get all expenses for a specific crop
 *     tags: [Expenses]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Crop ID for which to fetch expenses
 *         example: 64c2f41f9a23b4567f4d1234
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses with date greater than or equal to this value
 *         example: 2025-01-01
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter expenses with date less than or equal to this value
 *         example: 2025-01-31
 *     responses:
 *       200:
 *         description: List of expenses for the given crop
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 64c2f4df9a23b4567f4d5678
 *                   type:
 *                     type: string
 *                     example: Fertilizer
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: 2025-01-15
 *                   amount:
 *                     type: number
 *                     example: 500
 *                   notes:
 *                     type: string
 *                     example: Purchased organic fertilizer
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

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Add a new expense for a crop
 *     tags: [Expenses]
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
 *               - type
 *               - date
 *               - amount
 *             properties:
 *               cropId:
 *                 type: string
 *                 description: ID of the crop
 *                 example: 64c2f41f9a23b4567f4d1234
 *               type:
 *                 type: string
 *                 description: Type of expense
 *                 example: Fertilizer
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of expense
 *                 example: 2025-01-15
 *               amount:
 *                 type: number
 *                 description: Amount spent
 *                 example: 500
 *               notes:
 *                 type: string
 *                 description: Additional details about the expense
 *                 example: Purchased organic fertilizer
 *     responses:
 *       201:
 *         description: Expense added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: expense saved
 *       404:
 *         description: Crop not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Crop not found
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
    await expense.save();
    res.status(201).json({ message: "expense saved" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error." });
  }
});

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete an expense by ID
 *     tags: [Expenses]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the expense to delete
 *         example: 64c2f4df9a23b4567f4d5678
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: expense deleted
 *       404:
 *         description: Expense not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Expense not found
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
    const deleteExpense = await Expense.findByIdAndDelete(id);

    if (!deleteExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    return res.status(200).json({ message: "expense deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error." });
  }
});

module.exports = router;
