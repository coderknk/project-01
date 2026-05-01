const { body, param, query } = require("express-validator");

const signupValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["admin", "member"])
    .withMessage("Role must be admin or member"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const refreshValidation = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
];

const idParamValidation = [
  param("id").isMongoId().withMessage("Invalid ID parameter"),
];

const projectValidation = [
  body("name").trim().notEmpty().withMessage("Project name is required"),
  body("description").optional().trim(),
  body("teamMembers")
    .optional()
    .isArray()
    .withMessage("Team members must be an array"),
  body("teamMembers.*")
    .optional()
    .isMongoId()
    .withMessage("Each team member must be a valid user id"),
];

const updateProjectValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("description").optional().trim(),
];

const teamMembersValidation = [
  body("teamMembers")
    .isArray()
    .withMessage("Team members must be an array"),
  body("teamMembers.*")
    .optional()
    .isMongoId()
    .withMessage("Each team member must be a valid user id"),
];

const taskValidation = [
  body("title").trim().notEmpty().withMessage("Task title is required"),
  body("description").optional().trim(),
  body("assignedTo").isMongoId().withMessage("assignedTo must be a valid user id"),
  body("projectId").isMongoId().withMessage("projectId must be a valid project id"),
  body("status")
    .optional()
    .isIn(["todo", "in-progress", "done"])
    .withMessage("Invalid status"),
  body("dueDate").isISO8601().withMessage("dueDate must be a valid date"),
];

const taskStatusValidation = [
  body("status")
    .isIn(["todo", "in-progress", "done"])
    .withMessage("Invalid status"),
];

const taskQueryValidation = [
  query("projectId").optional().isMongoId().withMessage("Invalid project filter"),
  query("assignedTo").optional().isMongoId().withMessage("Invalid user filter"),
  query("status")
    .optional()
    .isIn(["todo", "in-progress", "done"])
    .withMessage("Invalid status filter"),
];

module.exports = {
  signupValidation,
  loginValidation,
  refreshValidation,
  projectValidation,
  updateProjectValidation,
  teamMembersValidation,
  taskValidation,
  taskStatusValidation,
  taskQueryValidation,
  idParamValidation,
};
