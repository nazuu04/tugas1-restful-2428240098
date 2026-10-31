const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, trim: true },
    spesialis: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);