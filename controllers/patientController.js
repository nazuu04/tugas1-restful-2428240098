const mongoose = require("mongoose");
const Patient = require("../models/patientModel");
const Doctor = require("../models/doctorModel");

const isKosong = (nilai) =>
  nilai === undefined || nilai === null || (typeof nilai === "string" && nilai.trim() === "");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function validasiPasien(body) {
  const { noRekamMedis, nama, tanggalLahir, jenisKelamin, alamat, dokter } = body;
  if (isKosong(noRekamMedis)) return "Field noRekamMedis wajib diisi";
  if (isKosong(nama)) return "Field nama wajib diisi";
  if (isKosong(tanggalLahir)) return "Field tanggalLahir wajib diisi";
  if (isKosong(jenisKelamin)) return "Field jenisKelamin wajib diisi";
  if (typeof noRekamMedis !== "string") return "Field noRekamMedis harus berupa teks";
  if (typeof nama !== "string") return "Field nama harus berupa teks";
  if (typeof tanggalLahir !== "string") return "Field tanggalLahir harus berupa teks";
  if (alamat !== undefined && typeof alamat !== "string") return "Field alamat harus berupa teks";
  const formatTanggal = /^\d{4}-\d{2}-\d{2}$/;
  if (!formatTanggal.test(tanggalLahir) || isNaN(new Date(tanggalLahir).getTime())) {
    return "Field tanggalLahir harus berformat YYYY-MM-DD";
  }
  if (jenisKelamin !== "L" && jenisKelamin !== "P") {
    return 'Field jenisKelamin harus "L" atau "P"';
  }
  if (dokter !== undefined && !mongoose.isValidObjectId(dokter)) {
    return "Field dokter harus berupa ID dokter yang valid";
  }
  return null;
}

const kirimError = (res, code, message) =>
  res.status(code).json({ status: "error", message, data: null });

const tidakDitemukan = (res, idParam) =>
  kirimError(res, 404, `Data dengan id ${idParam} tidak ditemukan`);

// hanya ambil field yang diizinkan dari body
const ambilField = (body) => {
  const hasil = {};
  ["noRekamMedis", "nama", "tanggalLahir", "jenisKelamin", "alamat", "dokter"].forEach((k) => {
    if (body[k] !== undefined) hasil[k] = body[k];
  });
  return hasil;
};

// Kembalikan pesan error jika dokter dirujuk tapi tidak ada di database
async function cekDokterAda(dokterId) {
  if (dokterId === undefined) return null;
  const ada = await Doctor.exists({ _id: dokterId });
  return ada ? null : "Dokter dengan id tersebut tidak ditemukan";
}

// Tangani error duplikat noRekamMedis (kode 11000)
const tanganiError = (err, res, next) => {
  if (err.code === 11000) return kirimError(res, 409, "noRekamMedis sudah terdaftar");
  next(err);
};

// ===== GET /patients : filtering, sorting, projection, pagination =====
exports.getAllPatients = async (req, res, next) => {
  try {
    const { nama, jenisKelamin, noRekamMedis, dokter, sort, fields } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

    // FILTERING
    const filter = {};
    if (jenisKelamin) filter.jenisKelamin = jenisKelamin;
    if (noRekamMedis) filter.noRekamMedis = noRekamMedis;
    if (nama) filter.nama = { $regex: escapeRegex(nama), $options: "i" };
    if (dokter) {
      if (!mongoose.isValidObjectId(dokter)) return kirimError(res, 400, "ID dokter tidak valid");
      filter.dokter = dokter;
    }

    // SORTING  contoh: ?sort=nama atau ?sort=-tanggalLahir,nama
    const sortBy = sort ? sort.split(",").join(" ") : "-createdAt";

    // PROJECTION  contoh: ?fields=nama,jenisKelamin
    const select = fields ? fields.split(",").join(" ") : "";

    const [data, total] = await Promise.all([
      Patient.find(filter)
        .select(select)
        .sort(sortBy)
        .skip((page - 1) * limit) // PAGINATION
        .limit(limit)
        .populate("dokter", "nama spesialis"), // ambil data referensi
      Patient.countDocuments(filter),
    ]);

    res.status(200).json({
      status: "success",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPatientById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return kirimError(res, 400, "ID tidak valid");
    const pasien = await Patient.findById(req.params.id).populate("dokter", "nama spesialis");
    if (!pasien) return tidakDitemukan(res, req.params.id);
    res.status(200).json(pasien);
  } catch (err) {
    next(err);
  }
};

exports.createPatient = async (req, res, next) => {
  try {
    const body = req.body || {};
    const pesanError = validasiPasien(body);
    if (pesanError) return kirimError(res, 400, pesanError);

    const errDokter = await cekDokterAda(body.dokter);
    if (errDokter) return kirimError(res, 400, errDokter);

    const baru = await Patient.create(ambilField(body));
    res.status(201).json({ status: "success", message: "Data pasien berhasil ditambahkan", data: baru });
  } catch (err) {
    tanganiError(err, res, next);
  }
};

// EMBEDDING: tambah riwayat kunjungan ke dalam dokumen pasien
exports.addKunjungan = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return kirimError(res, 400, "ID tidak valid");
    const { keluhan, diagnosa, tanggal } = req.body || {};
    if (isKosong(keluhan) || typeof keluhan !== "string") {
      return kirimError(res, 400, "Field keluhan wajib diisi dan berupa teks");
    }
    const pasien = await Patient.findById(req.params.id);
    if (!pasien) return tidakDitemukan(res, req.params.id);

    pasien.riwayatKunjungan.push({ keluhan, diagnosa, tanggal });
    await pasien.save();
    res.status(201).json({ status: "success", message: "Kunjungan berhasil ditambahkan", data: pasien });
  } catch (err) {
    next(err);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return kirimError(res, 400, "ID tidak valid");
    const body = req.body || {};
    const pesanError = validasiPasien(body);
    if (pesanError) return kirimError(res, 400, pesanError);

    const errDokter = await cekDokterAda(body.dokter);
    if (errDokter) return kirimError(res, 400, errDokter);

    const hasil = await Patient.findByIdAndUpdate(req.params.id, ambilField(body), {
      new: true,
      runValidators: true,
    });
    if (!hasil) return tidakDitemukan(res, req.params.id);
    res.status(200).json({ status: "success", message: "Data pasien berhasil diubah", data: hasil });
  } catch (err) {
    tanganiError(err, res, next);
  }
};

exports.deletePatient = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return kirimError(res, 400, "ID tidak valid");
    const hasil = await Patient.findByIdAndDelete(req.params.id);
    if (!hasil) return tidakDitemukan(res, req.params.id);
    res.status(200).json({
      status: "success",
      message: `Data pasien dengan id ${req.params.id} berhasil dihapus`,
      data: null,
    });
  } catch (err) {
    next(err);
  }
};