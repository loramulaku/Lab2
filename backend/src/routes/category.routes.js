const express  = require('express');
const router   = express.Router();
const Category = require('../models/sql/Category');

// Public — anyone can read categories (used for job-seeker filter tabs)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

module.exports = router;
