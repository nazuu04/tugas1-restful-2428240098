const router = require("express").Router();
const ctrl = require("../controllers/patientController");

router.get("/", ctrl.getAllPatients);
router.get("/:id", ctrl.getPatientById);
router.post("/", ctrl.createPatient);
router.post("/:id/kunjungan", ctrl.addKunjungan); // BARU
router.put("/:id", ctrl.updatePatient);
router.delete("/:id", ctrl.deletePatient);

module.exports = router;