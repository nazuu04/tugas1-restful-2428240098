const router = require('express').Router();
const Product = require('../models/product');

// CREATE
router.post('/', async (req, res) => {
  try {
    res.status(201).json(await Product.create(req.body));
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Tambah review (embedding)
router.post('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Tidak ditemukan' });
    product.reviews.push(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// GET UTAMA: filtering, sorting, projection, pagination
router.get('/', async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice, sort, fields } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);

    // FILTERING
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // SORTING  (?sort=-price,name)
    const sortBy = sort ? sort.split(',').join(' ') : '-createdAt';

    // PROJECTION (?fields=name,price)
    const select = fields ? fields.split(',').join(' ') : '';

    const [data, total] = await Promise.all([
      Product.find(filter)
        .select(select)
        .sort(sortBy)
        .skip((page - 1) * limit)   // PAGINATION
        .limit(limit)
        .populate('category', 'name description'), // ambil data referensi
      Product.countDocuments(filter)
    ]);

    res.json({
      page, limit, total,
      totalPages: Math.ceil(total / limit),
      data
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id).populate('category');
  if (!p) return res.status(404).json({ message: 'Tidak ditemukan' });
  res.json(p);
});

module.exports = router;