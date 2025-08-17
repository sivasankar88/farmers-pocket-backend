const express = require("express");
const Crop = require("../models/Crop");
const authenticate = require("../middleware/authMiddleware");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const router = express.Router();

router.use(authenticate);
/**
 * @swagger
 * /api/crops:
 *   get:
 *     summary: Get crops with expense, income, and profit details
 *     tags: [Crops]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter crops with date greater than or equal to this value
 *         example: 2025-01-01
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter crops with date less than or equal to this value
 *         example: 2025-01-31
 *       - in: query
 *         name: cropId
 *         schema:
 *           type: string
 *         description: Filter crops by specific crop ID
 *         example: 64c2f41f9a23b4567f4d1234
 *     responses:
 *       200:
 *         description: List of crops with calculated expenses, incomes, and profits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 64c2f41f9a23b4567f4d1234
 *                   name:
 *                     type: string
 *                     example: Wheat
 *                   acre:
 *                     type: number
 *                     example: 10
 *                   expenseAmount:
 *                     type: number
 *                     example: 1500
 *                   incomeAmount:
 *                     type: number
 *                     example: 3500
 *                   profit:
 *                     type: number
 *                     example: 2000
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

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { fromDate, toDate, cropId, pageNumber = 1 } = req.query;
    const query = { userId: userId };
    const limit = 5;
    if (cropId) query._id = cropId;
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) query.date.$lte = new Date(toDate);
    }

    // get total crops for pagination
    const totalRecords = await Crop.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    const crops = await Crop.find(query)
      .skip((pageNumber - 1) * limit)
      .limit(limit);
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

    return res.status(200).json({
      currentPage: Number(pageNumber),
      totalPages,
      totalRecords,
      data: cropsWithProfit,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error." });
  }
});

/**
 * @swagger
 * /api/crops/:
 *   post:
 *     summary: Add a new crop
 *     tags: [Crops]
 *     security:
 *       - SessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - acres
 *               - date
 *             properties:
 *               name:
 *                 type: string
 *                 example: Wheat
 *               acres:
 *                 type: integer
 *                 example: 5
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2025-08-01
 *     responses:
 *       201:
 *         description: Crop added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: crop added
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

/**
 * @swagger
 * /api/crops/{id}:
 *   delete:
 *     summary: Delete a crop by ID
 *     tags: [Crops]
 *     security:
 *       - SessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the crop to delete
 *         example: 64c2f41f9a23b4567f4d1234
 *     responses:
 *       200:
 *         description: Crop deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: crop deleted
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

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deletedCrop = await Crop.findByIdAndDelete(id);
    if (!deletedCrop) {
      return res.status(404).json({ message: "Crop not found" });
    }
    return res.status(200).json({ message: "crop deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error." });
  }
});
module.exports = router;
