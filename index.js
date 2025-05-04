const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const cropRoutes = require("./routes/crops.js");
const expenseRoutes = require("./routes/expenses.js");
const incomeRoutes = require("./routes/incomes.js");
const userRoutes = require("./routes/users.js");
require("dotenv").config();

//Connection to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors({ origin: "*", methods: "GET,POST,PUT,DELETE" }));
app.use(express.json());
//app.use(console.log("called"));
// Routes
app.use("/api/crops", cropRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/user", userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Application is runnig on the port ${process.env.PORT}`);
});
