const mongoose = require("mongoose");

const StoreSchema = new mongoose.Schema(
  {
    shop: { type: String, required: true },
    accessToken: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Store", StoreSchema);
