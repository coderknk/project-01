const express = require("express");
const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  setTeamMembers,
} = require("../controllers/projectController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const {
  projectValidation,
  updateProjectValidation,
  teamMembersValidation,
  idParamValidation,
} = require("../validators");

const router = express.Router();

router.use(protect);
router.get("/", getProjects);
router.post("/", authorize("admin"), projectValidation, validate, createProject);
router.put("/:id", authorize("admin"), idParamValidation, updateProjectValidation, validate, updateProject);
router.delete("/:id", authorize("admin"), idParamValidation, validate, deleteProject);
router.patch("/:id/members", authorize("admin"), idParamValidation, teamMembersValidation, validate, setTeamMembers);

module.exports = router;
