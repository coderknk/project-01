const Team = require("../models/Team");
const TeamMember = require("../models/TeamMember");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/response");

const hydrateTeams = async (teamDocs) => {
  const teams = Array.isArray(teamDocs) ? teamDocs : [teamDocs];
  const teamIds = teams.map((team) => team._id);
  const members = await TeamMember.find({ teamId: { $in: teamIds } })
    .populate("userId", "name email role")
    .sort({ createdAt: 1 });

  const memberMap = members.reduce((acc, member) => {
    const key = String(member.teamId);
    if (!acc[key]) acc[key] = [];
    acc[key].push(member);
    return acc;
  }, {});

  return teams.map((team) => ({
    ...team.toObject(),
    members: memberMap[String(team._id)] || [],
  }));
};

const createTeam = async (req, res, next) => {
  try {
    const { name } = req.body;
    const team = await Team.create({ name, createdBy: req.user._id });
    await TeamMember.create({ teamId: team._id, userId: req.user._id, memberRole: "manager" });

    const [hydrated] = await hydrateTeams(team);
    sendSuccess(res, {
      statusCode: 201,
      message: "Team created",
      data: { team: hydrated },
    });
  } catch (error) {
    next(error);
  }
};

const getTeams = async (req, res, next) => {
  try {
    let teams;

    if (req.user.role === "admin") {
      teams = await Team.find().sort({ createdAt: -1 });
    } else {
      const memberships = await TeamMember.find({ userId: req.user._id });
      const teamIds = memberships.map((member) => member.teamId);
      teams = await Team.find({ _id: { $in: teamIds } }).sort({ createdAt: -1 });
    }

    const hydrated = await hydrateTeams(teams);
    sendSuccess(res, { message: "Teams fetched", data: { teams: hydrated } });
  } catch (error) {
    next(error);
  }
};

const addTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, memberRole } = req.body;

    const [team, user] = await Promise.all([Team.findById(id), User.findById(userId)]);
    if (!team) return next(new AppError("Team not found", 404));
    if (!user) return next(new AppError("User not found", 404));

    await TeamMember.findOneAndUpdate(
      { teamId: id, userId },
      { memberRole: memberRole || "member" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const [hydrated] = await hydrateTeams(team);
    sendSuccess(res, { message: "Member added to team", data: { team: hydrated } });
  } catch (error) {
    next(error);
  }
};

const removeTeamMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const team = await Team.findById(id);
    if (!team) return next(new AppError("Team not found", 404));

    await TeamMember.findOneAndDelete({ teamId: id, userId });

    const [hydrated] = await hydrateTeams(team);
    sendSuccess(res, { message: "Member removed from team", data: { team: hydrated } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTeam, getTeams, addTeamMember, removeTeamMember };
