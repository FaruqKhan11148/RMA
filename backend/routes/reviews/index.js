const express = require('express');

const reviewRoutes = require('./review.routes');

const router = express.Router();

router.use('/', reviewRoutes);

module.exports = router;
