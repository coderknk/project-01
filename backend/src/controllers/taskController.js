const Task = require("../models/Task");
const Team = require("../models/Team");
const TeamMember = require("../models/TeamMember");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/response");

const taskPopulate = [
  { path: "assigneeId", select: "name email role" },
  { path: "teamId", select: "name" },
  { path: "createdBy", select: "name email role" },
];

const isTeamMember = async (teamId, userId) => {
  const membership = await TeamMember.findOne({ teamId, userId });
  return Boolean(membership);
};

const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      assigneeId,
      assignedTo,
      teamId,
      projectId,
      status,
      priority,
      dueDate,
    } = req.body;
    const resolvedTeamId = teamId || projectId;
    const resolvedAssigneeId = assigneeId || assignedTo;

    if (!resolvedTeamId || !resolvedAssigneeId) {
      return next(new AppError("teamId and assigneeId are required", 400));
    }

    const [team, membership] = await Promise.all([
      Team.findById(resolvedTeamId),
      TeamMember.findOne({ teamId: resolvedTeamId, userId: resolvedAssigneeId }),
    ]);

    if (!team) {
      return next(new AppError("Team not found", 404));
    }
    if (!membership) {
      return next(new AppError("Assignee must be part of the selected team", 400));
    }

    const task = await Task.create({
      title,
      description,
      assigneeId: resolvedAssigneeId,
      assignedTo: resolvedAssigneeId,
      teamId: resolvedTeamId,
      projectId: resolvedTeamId,
      status,
      priority: priority || "medium",
      dueDate,
      createdBy: req.user._id,
    });

    const populated = await task.populate(taskPopulate);

    sendSuccess(res, {
      statusCode: 201,
      message: "Task created",
      data: { task: populated },
    });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { teamId, projectId, assigneeId, assignedTo, status, priority, view } = req.query;
    const query = {};

    if (teamId || projectId) query.teamId = teamId || projectId;
    if (assigneeId || assignedTo) query.assigneeId = assigneeId || assignedTo;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    if (req.user.role === "member") {
      if (view === "team") {
        const memberships = await TeamMember.find({ userId: req.user._id });
        query.teamId = { $in: memberships.map((member) => member.teamId) };
      } else {
        query.$or = [{ assigneeId: req.user._id }, { assignedTo: req.user._id }];
      }
    }

    const tasks = await Task.find(query)
      .populate(taskPopulate)
      .sort({ dueDate: 1 });

    sendSuccess(res, { message: "Tasks fetched", data: { tasks } });
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

    if (req.body.teamId && !(await Team.findById(req.body.teamId))) {
      return next(new AppError("Team not found", 404));
    }

    Object.assign(task, req.body);
    if (req.body.assigneeId) {
      const teamToCheck = req.body.teamId || task.teamId;
      const memberOk = await isTeamMember(teamToCheck, req.body.assigneeId);
      if (!memberOk) {
        return next(new AppError("Assignee must be part of the selected team", 400));
      }
      task.assignedTo = req.body.assigneeId;
    }
    if (req.body.teamId) {
      task.projectId = req.body.teamId;
    }

    await task.save();

    const populated = await task.populate(taskPopulate);

    sendSuccess(res, { message: "Task updated", data: { task: populated } });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, progressNote } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    if (req.user.role === "member" && String(task.assigneeId || task.assignedTo) !== String(req.user._id)) {
      return next(new AppError("You can only update your own tasks", 403));
    }

    if (status) task.status = status;
    if (progressNote !== undefined) task.progressNote = progressNote;
    await task.save();

    const populated = await task.populate(taskPopulate);

    sendSuccess(res, { message: "Task status updated", data: { task: populated } });
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

    sendSuccess(res, { message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const query =
      req.user.role === "member"
        ? { $or: [{ assigneeId: req.user._id }, { assignedTo: req.user._id }] }
        : {};
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

    const inProgressTasks = await Task.countDocuments({ ...query, status: "in-progress" });

    sendSuccess(res, {
      message: "Dashboard stats fetched",
      data: { totalTasks, completedTasks, overdueTasks, inProgressTasks },
    });
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
