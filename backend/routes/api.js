const express = require('express');
const router = express.Router();
const {
  getHealth,
  getOperations,
  postCalculate,
} = require('../controllers/calculatorController');

// GET /api/health
router.get('/health', getHealth);

// GET /api/operations
router.get('/operations', getOperations);

// POST /api/calculate
router.post('/calculate', postCalculate);

// POST /api/:operation (e.g., /api/add, /api/subtract, /api/multiply, /api/divide, etc.)
router.post('/:operation', postCalculate);

module.exports = router;

