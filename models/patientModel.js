const mongoose = require("mongoose");

// EMBEDDING: sub-dokumen kunjungan di dalam pasien
const kunjunganSchema = new mongoose.Schema(
  {
    tanggal: { type: Date, default: Date.now },
    keluhan: { type: String, required: true, trim: true },
    diagnosa: { type: String, trim: true },
  },
  { timestamps: true }
);

const patientSchema = new mongoose.Schema(
  {
    noRekamMedis: { type: String, required: true, unique: true, trim: true },
    nama: { type: String, required: true, trim: true },
    tanggalLahir: { type: Date, required: true },
    jenisKelamin: { type: String, enum: ["L", "P"], required: true },
    alamat: { type: String, trim: true },

    // REFERENCING: menunjuk ke koleksi Doctor
    dokter: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },

    // EMBEDDING
    riwayatKunjungan: [kunjunganSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);