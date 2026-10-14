const mongoose = require("mongoose");

const tenantQueryFilter = (req, additionalFilters = {}) => {
  if (!req.user) {
    const error = new Error("Authentication required.");
    error.statusCode = 401;
    throw error;
  }

  if (!mongoose.isValidObjectId(req.user.tenantId)) {
    const error = new Error("A valid tenant is required to access this resource.");
    error.statusCode = 403;
    throw error;
  }

  return {
    ...additionalFilters,
    tenantId: req.user.tenantId,
  };
};

module.exports = tenantQueryFilter;
