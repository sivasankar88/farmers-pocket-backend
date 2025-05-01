const jwt = require("jsonwebtoken");

require("dotenv").config();
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.sessionauth;
    if (!token) {
      return res.status(401).json({ message: "Invalid token access" });
    }
    const decode = jwt.verify(token.slice(7), process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token access" });
  }
};
module.exports = authenticate;
