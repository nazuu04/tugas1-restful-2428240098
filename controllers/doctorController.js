const Doctor = require("../models/doctorModel");

exports.getAllDoctors = async (req, res, next) => {
  try {
    res.status(200).json(await Doctor.find());
  } catch (err) {
    next(err);
  }
};

exports.createDoctor = async (req, res, next) => {
  try {
    const { nama, spesialis } = req.body || {};
    if (!nama || !spesialis) {
      return res.status(400).json({ status: "error", message: "nama dan spesialis wajib diisi", data: null });
    }
    const baru = await Doctor.create({ nama, spesialis });
    res.status(201).json({ status: "success", message: "Dokter berhasil ditambahkan", data: baru });
  } catch (err) {
    next(err);
  }
};