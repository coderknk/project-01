const User = require("../models/User");
const { sendSuccess } = require("../utils/response");

const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select("name email role").sort({ createdAt: -1 });
    sendSuccess(res, { message: "Users fetched", data: { users } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers };
