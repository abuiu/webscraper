// router.js
const express = require('express');
const router = express.Router();
const scrapeController = require('./scrapeController');

router.post('/scrape', scrapeController.scrapeWeb);

module.exports = router;
