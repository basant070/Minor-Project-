const mongoose = require("mongoose");
const User = require("../models/User");
const tenantQueryFilter = require("../utils/tenantScope");

const listStudents = async (req, res, next) => {
  try {
    const students = await User.find(
      tenantQueryFilter(req, { role: "student" }),
    )
      .select("name email role tenantId status emailVerified createdAt")
      .sort({ name: 1 });

    return res.json({ users: students });
  } catch (error) {
    return next(error);
  }
};

const listAlumni = async (req, res, next) => {
  try {
    const alumni = await User.find(
      tenantQueryFilter(req, { role: "alumni" }),
    )
      .select("name email role tenantId status emailVerified createdAt")
      .sort({ name: 1 });

    return res.json({ users: alumni });
  } catch (error) {
    return next(error);
  }
};

const removeUser = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res.status(400).json({ message: "A valid user ID is required." });
    }

    const user = await User.findOneAndDelete(
      tenantQueryFilter(req, {
        _id: req.params.userId,
        role: { $in: ["student", "alumni"] },
      }),
    );
    if (!user) {
      return res.status(404).json({
        message: "Student or alumnus not found in your institute.",
      });
    }

    return res.json({ message: "Account permanently removed." });
  } catch (error) {
    return next(error);
  }
};

module.exports = { listAlumni, listStudents, removeUser };
