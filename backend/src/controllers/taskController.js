const Task = require("../models/Task");
const Project = require("../models/Project");
const AppError = require("../utils/AppError");

const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, projectId, status, dueDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      projectId,
      status,
      dueDate,
      createdBy: req.user._id,
    });

    const populated = await task.populate([
      { path: "assignedTo", select: "name email role" },
      { path: "projectId", select: "name" },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { projectId, assignedTo, status } = req.query;
    const query = {};

    if (projectId) query.projectId = projectId;
    if (assignedTo) query.assignedTo = assignedTo;
    if (status) query.status = status;

    if (req.user.role === "member") {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email role")
      .populate("projectId", "name")
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    Object.assign(task, req.body);
    await task.save();

    const populated = await task.populate([
      { path: "assignedTo", select: "name email role" },
      { path: "projectId", select: "name" },
    ]);

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    if (req.user.role === "member" && String(task.assignedTo) !== String(req.user._id)) {
      return next(new AppError("You can only update your own tasks", 403));
    }

    task.status = status;
    await task.save();

    const populated = await task.populate([
      { path: "assignedTo", select: "name email role" },
      { path: "projectId", select: "name" },
    ]);

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return next(new AppError("Task not found", 404));
    }

    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const query = req.user.role === "member" ? { assignedTo: req.user._id } : {};
    const now = new Date();

    const [totalTasks, completedTasks, overdueTasks] = await Promise.all([
      Task.countDocuments(query),
      Task.countDocuments({ ...query, status: "done" }),
      Task.countDocuments({
        ...query,
        status: { $ne: "done" },
        dueDate: { $lt: now },
      }),
    ]);

    res.json({ totalTasks, completedTasks, overdueTasks });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getDashboardStats,
};
