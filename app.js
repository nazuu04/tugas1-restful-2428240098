// ============================================================
// Tugas 1 - RESTful API Murni dengan Express.js
// Topik 5 : Rumah Sakit -> Pasien (/patients)
// Nama    : Nazwa Munthaha Hendriyani Nasution
// NPM     : 2428240098
// ============================================================

const express = require("express");
const app = express();

app.use(express.json());

const patients = [
  { id: 1, noRekamMedis: "RM-000123", nama: "Dewi Lestari", tanggalLahir: "1998-04-17", jenisKelamin: "P", alamat: "Jl. Merdeka 10, Bandung" },
];

let nextId = 4;

const isKosong = (nilai) =>
  nilai === undefined || nilai === null || (typeof nilai === "string" && nilai.trim() === "");

function validasiPasien(body) {
  const { noRekamMedis, nama, tanggalLahir, jenisKelamin, alamat } = body;
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
  return null;
}

app.get("/", (req, res) => {
  res.status(200).json({
    nama: "Nazwa Munthaha Hendriyani Nasution",
    npm: "2428240098",
    topik: 5,
    deskripsi: "RESTful API Rumah Sakit - Pasien",
    endpoints: [
      "GET /patients",
      "GET /patients/:id",
      "GET /patients?jenisKelamin=P",
      "POST /patients",
      "PUT /patients/:id",
      "DELETE /patients/:id",
    ],
  });
});

app.get("/patients", (req, res) => {
  const { jenisKelamin } = req.query;
  if (jenisKelamin !== undefined) {
    const hasil = patients.filter(
      (p) => p.jenisKelamin.toLowerCase() === String(jenisKelamin).toLowerCase()
    );
    return res.status(200).json(hasil);
  }
  res.status(200).json(patients);
});

app.get("/patients/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const pasien = patients.find((p) => p.id === id);
  if (!pasien) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${req.params.id} tidak ditemukan`,
      data: null,
    });
  }
  res.status(200).json(pasien);
});

app.post("/patients", (req, res) => {
  const body = req.body || {};
  const pesanError = validasiPasien(body);
  if (pesanError) {
    return res.status(400).json({ status: "error", message: pesanError, data: null });
  }
  const { noRekamMedis, nama, tanggalLahir, jenisKelamin, alamat } = body;
  const baru = { id: nextId++, noRekamMedis, nama, tanggalLahir, jenisKelamin, alamat: alamat !== undefined ? alamat : "" };
  patients.push(baru);
  res.status(201).json({ status: "success", message: "Data pasien berhasil ditambahkan", data: baru });
});

app.put("/patients/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = patients.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${req.params.id} tidak ditemukan`,
      data: null,
    });
  }
  const body = req.body || {};
  const pesanError = validasiPasien(body);
  if (pesanError) {
    return res.status(400).json({ status: "error", message: pesanError, data: null });
  }
  const { noRekamMedis, nama, tanggalLahir, jenisKelamin, alamat } = body;
  patients[index] = { id, noRekamMedis, nama, tanggalLahir, jenisKelamin, alamat: alamat !== undefined ? alamat : "" };
  res.status(200).json({ status: "success", message: "Data pasien berhasil diubah", data: patients[index] });
});

app.delete("/patients/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = patients.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({
      status: "error",
      message: `Data dengan id ${req.params.id} tidak ditemukan`,
      data: null,
    });
  }
  patients.splice(index, 1);
  res.status(200).json({ status: "success", message: `Data pasien dengan id ${id} berhasil dihapus`, data: null });
});

app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Endpoint tidak ditemukan", data: null });
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ status: "error", message: "Format JSON pada body tidak valid", data: null });
  }
  res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));

module.exports = app;