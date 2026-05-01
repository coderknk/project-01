const express = require("express");
const { getUsers } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getUsers);

module.exports = router;
