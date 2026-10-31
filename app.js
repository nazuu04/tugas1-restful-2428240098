require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const logger = require("./middlewares/logger");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.status(200).json({
    nama: "Nazwa Munthaha Hendriyani Nasution",
    npm: "2428240098",
    topik: 5,
    deskripsi: "RESTful API Rumah Sakit - Pasien (MongoDB)",
    endpoints: [
      "GET /patients?page=1&limit=5&sort=-umur&fields=nama,umur&jenisKelamin=P&nama=siti",
      "GET /patients/:id",
      "POST /patients",
      "POST /patients/:id/kunjungan",
      "PUT /patients/:id",
      "DELETE /patients/:id",
      "GET /doctors",
      "POST /doctors",
    ],
  });
});

app.use("/patients", patientRoutes);
app.use("/doctors", doctorRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Server berjalan di http://localhost:${PORT}`)
  );
});

module.exports = app;