const router = require('express').Router();
const Category = require('../models/category');

router.post('/', async (req, res) => {
  try {
    res.status(201).json(await Category.create(req.body));
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.get('/', async (req, res) => {
  res.json(await Category.find());
});

module.exports = router;