const express = require('express');
const {
  registerCustomer,
  loginCustomer,
  loginAdmin,
  getAdminStats,
  getAdminUsers,
  getAdminContacts,
} = require('../controllers/authController');

const router = express.Router();

const { googleLogin } = require("../controllers/authController");

router.post("/google-login", googleLogin);


// ================= CUSTOMER =================
router.post('/customer/register', registerCustomer);
router.post('/customer/login', loginCustomer);

// ================= ADMIN =================
router.post('/admin/login', loginAdmin);

// ✅ NEW ADMIN DASHBOARD ROUTES
router.get('/admin/stats', getAdminStats);
router.get('/admin/users', getAdminUsers);
router.get('/admin/contacts', getAdminContacts);

module.exports = router;