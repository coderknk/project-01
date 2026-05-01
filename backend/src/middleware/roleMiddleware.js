const AppError = require("../utils/AppError");

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError("Forbidden: insufficient role", 403));
  }
  next();
};

module.exports = authorize;
