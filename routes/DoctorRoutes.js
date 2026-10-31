const router = require("express").Router();
const ctrl = require("../controllers/doctorController");

router.get("/", ctrl.getAllDoctors);
router.post("/", ctrl.createDoctor);

module.exports = router;