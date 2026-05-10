const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

router.use(auth);
router.use(isAdmin);

router.get('/stats', adminCtrl.getDashboardStats);
router.get('/roles', adminCtrl.getRoles);

router.get('/users', adminCtrl.getUsers);
router.get('/users/:id', adminCtrl.getUserById);
router.post('/users', adminCtrl.createUser);
router.put('/users/:id', adminCtrl.updateUser);
router.delete('/users/:id', adminCtrl.deleteUser);

router.get('/jobs', adminCtrl.getJobs);
router.get('/jobs/:id', adminCtrl.getJobById);
router.put('/jobs/:id', adminCtrl.updateJob);
router.delete('/jobs/:id', adminCtrl.deleteJob);

router.get('/companies', adminCtrl.getCompanies);
router.get('/companies/:id', adminCtrl.getCompanyById);
router.put('/companies/:id', adminCtrl.updateCompany);
router.delete('/companies/:id', adminCtrl.deleteCompany);

router.get('/applications', adminCtrl.getApplications);

module.exports = router;
