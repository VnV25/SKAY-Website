const express = require('express');
const {
  registerCustomer,
  loginCustomer,
  loginAdmin,
  googleLogin,
  getAdminStats,
  getAdminUsers,
  getAdminContacts,
  getCurrentCustomer,
} = require('../controllers/authController');

const router = express.Router();

router.post('/google-login', googleLogin);

router.post('/customer/register', registerCustomer);
router.post('/customer/login', loginCustomer);
router.get('/me', getCurrentCustomer);

router.post('/admin/login', loginAdmin);
router.get('/admin/stats', getAdminStats);
router.get('/admin/users', getAdminUsers);
router.get('/admin/contacts', getAdminContacts);

module.exports = router;
