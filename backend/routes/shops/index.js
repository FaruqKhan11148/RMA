const express = require('express');

const shopRoutes = require('./shop.routes');

const router = express.Router();

router.use('/', shopRoutes);

module.exports = router;
