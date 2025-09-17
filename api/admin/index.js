const express = require('express');
const router = express.Router();

// Import physical card management handlers
const {
  getPhysicalCardRequests,
  getPhysicalCardStats,
  updatePhysicalCardRequest,
  getPhysicalCardRequest,
  bulkUpdatePhysicalCardRequests
} = require('./physical-cards');

// Physical Card Management Routes
router.get('/physical-cards', getPhysicalCardRequests);
router.get('/physical-cards/stats', getPhysicalCardStats);
router.get('/physical-cards/:id', getPhysicalCardRequest);
router.put('/physical-cards/:id', updatePhysicalCardRequest);
router.put('/physical-cards/bulk-update', bulkUpdatePhysicalCardRequests);

module.exports = router;
