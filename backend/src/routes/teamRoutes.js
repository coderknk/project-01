const express = require("express");
const {
  createTeam,
  getTeams,
  addTeamMember,
  removeTeamMember,
} = require("../controllers/teamController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const {
  teamValidation,
  teamMemberValidation,
  idParamValidation,
  teamMemberDeleteValidation,
} = require("../validators");

const router = express.Router();

router.use(protect);
router.get("/", getTeams);
router.post("/", authorize("admin"), teamValidation, validate, createTeam);
router.post(
  "/:id/members",
  authorize("admin"),
  idParamValidation,
  teamMemberValidation,
  validate,
  addTeamMember
);
router.delete(
  "/:id/members/:userId",
  authorize("admin"),
  teamMemberDeleteValidation,
  validate,
  removeTeamMember
);

module.exports = router;
