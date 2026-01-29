const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getUsers, getAdminOverview } = require('../controllers/userController');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/admin/overview', protect, authorize('admin'), getAdminOverview);

module.exports = router;
