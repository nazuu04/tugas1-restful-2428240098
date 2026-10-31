const notFound = (req, res) => {
  res.status(404).json({ status: "error", message: "Endpoint tidak ditemukan", data: null });
};

const errorHandler = (err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ status: "error", message: "Format JSON pada body tidak valid", data: null });
  }
  res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
};

module.exports = { notFound, errorHandler };