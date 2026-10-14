const express = require("express");
const mongoose = require("mongoose");
const Department = require("../models/Department");
const Tenant = require("../models/Tenant");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const institutes = await Tenant.find({ status: "active" })
      .select("name slug")
      .sort({ name: 1 });

    return res.json({ institutes });
  } catch (error) {
    return next(error);
  }
});

router.get("/:tenantId/departments", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.tenantId)) {
      return res.status(400).json({ message: "A valid institute ID is required." });
    }

    const tenant = await Tenant.findOne({
      _id: req.params.tenantId,
      status: "active",
    }).select("_id");
    if (!tenant) {
      return res.status(404).json({ message: "The selected institute is unavailable." });
    }

    const departments = await Department.find({
      tenantId: tenant._id,
      status: "active",
    })
      .select("name")
      .sort({ name: 1 });

    return res.json({ departments });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
