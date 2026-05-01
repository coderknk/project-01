const Project = require("../models/Project");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const createProject = async (req, res, next) => {
  try {
    const { name, description, teamMembers = [] } = req.body;

    const validMembers = await User.find({ _id: { $in: teamMembers } });
    if (validMembers.length !== teamMembers.length) {
      return next(new AppError("One or more team members are invalid", 400));
    }

    const project = await Project.create({
      name,
      description,
      teamMembers,
      createdBy: req.user._id,
    });

    const populated = await project.populate("teamMembers", "name email role");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const query =
      req.user.role === "admin"
        ? {}
        : {
            $or: [{ teamMembers: req.user._id }, { createdBy: req.user._id }],
          };

    const projects = await Project.find(query)
      .populate("teamMembers", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;

    await project.save();
    const populated = await project.populate("teamMembers", "name email role");

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Project.findByIdAndDelete(id);

    if (!deleted) {
      return next(new AppError("Project not found", 404));
    }

    res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};

const setTeamMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { teamMembers } = req.body;

    const validMembers = await User.find({ _id: { $in: teamMembers } });
    if (validMembers.length !== teamMembers.length) {
      return next(new AppError("One or more team members are invalid", 400));
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { teamMembers },
      { new: true }
    ).populate("teamMembers", "name email role");

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  setTeamMembers,
};
