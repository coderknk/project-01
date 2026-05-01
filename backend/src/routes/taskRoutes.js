const express = require("express");
const {
  createTask,
  getTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getDashboardStats,
} = require("../controllers/taskController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const {
  taskValidation,
  taskStatusValidation,
  taskQueryValidation,
  idParamValidation,
} = require("../validators");

const router = express.Router();

router.use(protect);
router.get("/", taskQueryValidation, validate, getTasks);
router.get("/dashboard/stats", getDashboardStats);
router.post("/", authorize("admin"), taskValidation, validate, createTask);
router.put("/:id", authorize("admin"), idParamValidation, validate, updateTask);
router.patch("/:id/status", idParamValidation, taskStatusValidation, validate, updateTaskStatus);
router.delete("/:id", authorize("admin"), idParamValidation, validate, deleteTask);

module.exports = router;
