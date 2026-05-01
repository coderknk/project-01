const User = require("../models/User");

const getUsers = async (_req, res, next) => {
  try {
    const users = await User.find().select("name email role").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers };
