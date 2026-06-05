const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');
const themeCtrl = require('../controllers/theme.controller');
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

router.post('/theme', themeCtrl.update);
router.put('/theme/:id', themeCtrl.update);
router.post('/theme/:id/activate', themeCtrl.setActive);

router.get('/categories',        adminCtrl.getCategories);
router.post('/categories',       adminCtrl.createCategory);
router.put('/categories/:id',    adminCtrl.updateCategory);
router.delete('/categories/:id', adminCtrl.deleteCategory);

module.exports = router;
