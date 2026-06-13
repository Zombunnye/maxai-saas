const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
    },

    ownerEmail: {
      type: String,
      required: true,
    },

    plan: {
      type: String,
      enum: ["free", "starter", "pro"],
      default: "free",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tenant", tenantSchema);